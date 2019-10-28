'use strict';

const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const glimmer = require('@glimmer/syntax');
const stripBom = require('strip-bom');
const parseJson = require('json-to-ast');
const estreeWalk = require('estree-walker').walk;
const Filter = require('broccoli-persistent-filter');
const arrayUnique = require('./utils/array-unique');
const debug = require('debug');

function processJs(content) {
	const list = [];
	const ast = acorn.parse(content, {
		sourceType: 'module'
	});

	walk.simple(ast, {
		Literal({ value }) {
			list.push(value);
		}
	});

	return list;
}

function processHbs(content) {
	const list = [];

	content = stripBom(content);

	const ast = glimmer.preprocess(content);

	glimmer.traverse(ast, {
		StringLiteral({ value }) {
			list.push(value);
		}
	});

	return list;
}

function processJson(content) {
	const list = [];
	const ast = parseJson(content, { loc: false });

	estreeWalk(ast, {
		enter({ type, value }) {
			if (type === 'Literal') {
				list.push(value);
			}
		}
	});

	return list;
}

function getExt(filename) {
	return path.extname(filename).replace(/^\./, '');
}

module.exports = class FilterLiterals extends Filter {
	constructor(inputNode, options = {}) {
		options = Object.assign({
			persist: true,
			annotation: 'ember-cli-intl-shake:filter-literals',
			async: true
		}, options);

		super(inputNode, options);

		this.debug = debug(options.annotation);
	}

	getDestFilePath(relativePath) {
		const ext = getExt(relativePath);

		if (['js', 'hbs', 'json'].includes(ext)) {
			return `${relativePath}.intl.json`;
		}

		return null;
	}

	baseDir() {
		return path.resolve(__dirname, '..');
	}

	async processString(content, relativePath) {
		this.debug(`processing file '${relativePath}'`);

		const ext = getExt(relativePath);
		let list;

		if (ext === 'js') {
			list = processJs(content, relativePath);
		} else if (ext === 'hbs') {
			list = processHbs(content, relativePath);
		} else if (ext === 'json') {
			list = processJson(content, relativePath);
		}

		list = arrayUnique(list).filter((item) => typeof item === 'string');

		return JSON.stringify(list);
	}
};
