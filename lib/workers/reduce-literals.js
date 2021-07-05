const workerpool = require('workerpool');
const path = require('path');
const readF = require('../utils/read-file');
const writeF = require('../utils/write-file');
const shouldWriteF = require('../utils/should-write-file');

async function readFile(entry) {
	const filePath = path.join(entry.basePath, entry.relativePath);
	const content = await readF(filePath);
	const literals = JSON.parse(content);

	return [literals, entry.relativePath];
}

async function writeModule([module, literals]) {
	const filename = path.join(this.outputPath, module, this.outputFile);
	const content = JSON.stringify(literals);

	if (await shouldWriteF(filename, content)) {
		await writeF(filename, content);
	}
}

workerpool.worker({
	readFile,
	writeModule,
});
