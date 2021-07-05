'use strict';

const path = require('path');
const CachingWriter = require('broccoli-caching-writer');
const debug = require('debug');
const workerpool = require('workerpool');

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

	async build() {
		const entries = this.listEntries();
		const modules = groupByModule(entries, this.modules);
		const pool = workerpool.pool(
			path.join(__dirname, 'workers/reduce-literals.js')
		);

		this.debug('writing modules...');

		const tasks = Object.entries(modules).map(([module, paths]) =>
			pool.exec('writeModule', [this.outputPath, this.outputFile, module, paths])
		);

		await Promise.all(tasks);
		pool.terminate();
	}
};
