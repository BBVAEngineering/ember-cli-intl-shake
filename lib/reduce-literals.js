'use strict';

const path = require('path');
const shouldWriteFile = require('./utils/should-write-file');
const readFile = require('./utils/read-file');
const writeFile = require('./utils/write-file');
const CachingWriter = require('broccoli-caching-writer');
const mapLimit = require('async/mapLimit');
const eachLimit = require('async/eachLimit');
const { MAX_CONCURRENT } = require('./constants');
const arrayUnique = require('./utils/array-unique');
const debug = require('debug');

function cleanModules(modules) {
	return Object.entries(modules).reduce((acc, [module, literals]) => {
		literals = literals.map((literal) => literal.trim());
		literals = arrayUnique(literals);
		literals = literals.filter((literal) => literal.match(/^[\w-]+(?:\.[\w-]+)+$/));

		acc[module] = literals;

		return acc;
	}, {});
}

function groupByModule(files, modules) {
	return files.reduce((acc, [literals, relativePath]) => {
		const module = modules.find((mod) => relativePath.match(new RegExp(`^${mod}`)));

		if (!acc[module]) {
			acc[module] = literals;
		} else {
			acc[module].push(...literals);
		}

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

	async readFile(entry) {
		const filePath = path.join(entry.basePath, entry.relativePath);
		const content = await readFile(filePath);
		const literals = JSON.parse(content);

		return [literals, entry.relativePath];
	}

	async readFiles() {
		this.debug('reading files...');

		const entries = this.listEntries();

		return await mapLimit(entries, MAX_CONCURRENT, this.readFile.bind(this));
	}

	async writeModule([module, literals]) {
		const filename = path.join(this.outputPath, module, this.outputFile);
		const content = JSON.stringify(literals);

		if (await shouldWriteFile(filename, content)) {
			await writeFile(filename, content);
		}
	}

	async build() {
		const files = await this.readFiles();
		let modules = groupByModule(files, this.modules);

		this.debug('cleaning modules...');

		modules = cleanModules(modules);

		this.debug('writing modules...');

		await eachLimit(Object.entries(modules), MAX_CONCURRENT, this.writeModule.bind(this));
	}
};
