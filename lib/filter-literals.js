'use strict';

const path = require('path');
const Filter = require('broccoli-persistent-filter');
const arrayUnique = require('./utils/array-unique');
const debug = require('debug');

function getExt(filename) {
	return path.extname(filename).replace(/^\./, '');
}

module.exports = class FilterLiterals extends Filter {
	constructor(inputNode, options = {}) {
		options = Object.assign({
			filters: {},
			persist: true,
			annotation: 'ember-cli-intl-shake:filter-literals',
			async: true
		}, options);

		super(inputNode, options);

		this.debug = debug(options.annotation);
		this.filters = options.filters;
	}

	isValidExtension(ext) {
		return this.filters.some((filter) =>
			filter.extensions.some((extension) => extension === ext));
	}

	getDestFilePath(relativePath) {
		const ext = getExt(relativePath);

		if (this.isValidExtension(ext)) {
			return `${relativePath}.intl.json`;
		}

		return null;
	}

	baseDir() {
		return path.resolve(__dirname, '..');
	}

	processContent(content, relativePath) {
		const ext = getExt(relativePath);
		const flt = this.filters.find((filter) =>
			filter.extensions.find((extension) => extension === ext));

		return flt.filter(content, relativePath);
	}

	async processString(content, relativePath) {
		this.debug(`processing file '${relativePath}'`);

		let list = this.processContent(content, relativePath);

		list = arrayUnique(list).filter((item) => typeof item === 'string');

		return JSON.stringify(list);
	}
};
