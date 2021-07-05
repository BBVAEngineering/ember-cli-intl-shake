const workerpool = require('workerpool');
const path = require('path');
const fs = require('fs-extra');
const { Transform } = require('stream');
const mergeStream = require('merge-stream');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamValues } = require('stream-json/streamers/StreamValues');

const joinStream = () => new Transform({
	transform(chunk, encoding, callback) {
		this.data = this.data || [];
		this.data.push(chunk.toString('utf8'));
		callback();
	},
	flush() {
		const value = JSON.stringify([...new Set(this.data)]);

		this.push(value);
		this.push(null);
	}
});

async function writeModule(outputPath, outputFile, module, paths) {
	const outputDir = path.join(outputPath, module);
	const filename = path.join(outputDir, outputFile);

	await fs.ensureDir(outputDir);

	return new Promise((resolve, reject) => {
		const pipelines = paths.map((entryPath) => chain([
			fs.createReadStream(entryPath),
			parser(),
			// Parse each array entry
			streamValues(),
			// Trim strings
			({ value }) => value.map((s) => s.trim()),
			// Filter valid values
			(value) => {
				const isValid = value && value.match(/^[\w-]+(?:\.[\w-]+)+$/);

				return isValid && value;
			}
		]));

		const writeStream = chain([
			// Merge all arrays in a single one
			mergeStream(pipelines),
			// Transform all entries in a stringified Array
			joinStream(),
			fs.createWriteStream(filename)
		]);

		writeStream.on('end', resolve);
		writeStream.on('error', reject);
	});
}

workerpool.worker({
	writeModule,
});
