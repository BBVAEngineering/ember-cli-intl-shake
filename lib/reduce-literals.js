'use strict';

const path = require('path');
const CachingWriter = require('broccoli-caching-writer');
const debug = require('debug');
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

function groupByModule(entries, modules) {
	return entries.reduce((acc, entry) => {
		const module = modules.find((mod) => entry.relativePath.match(new RegExp(`^${mod}`)));
		const entryAbsPath = path.join(entry.basePath, entry.relativePath);

		if (!acc[module]) {
			acc[module] = [];
		}

		acc[module].push(entryAbsPath);

		return acc;
	}, {});
}

module.exports = class ReduceLiterals extends CachingWriter {
	constructor(inputNodes, options) {
		options = Object.assign({
			outputFile: 'intl-literals.json',
			annotation: 'ember-cli-intl-shake:reduce-literals',
			cacheInclude: [/\.intl\.json$/],
			modules: [],
			persistentOutput: true
		}, options);

		super(inputNodes, options);

		this._debug = debug(options.annotation);
		this.outputFile = options.outputFile;
		this.modules = options.modules;
	}

	async readEntries() {
		this.debug('reading files...');

		return this.listEntries();
	}

	async writeModule([module, paths]) {
		const outputDir = path.join(this.outputPath, module);
		const filename = path.join(outputDir, this.outputFile);

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

	async build() {
		const entries = this.listEntries();
		const modules = groupByModule(entries, this.modules);

		this.debug('writing modules...');

		for (const entry of Object.entries(modules)) {
			await this.writeModule(entry);
		}
	}
};
