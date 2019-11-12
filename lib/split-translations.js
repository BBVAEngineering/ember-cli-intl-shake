'use strict';

const path = require('path');
const TrackingWriter = require('./tracking-writer');
const shouldWriteFile = require('./utils/should-write-file');
const readFile = require('./utils/read-file');
const writeFile = require('./utils/write-file');
const arrayUnique = require('./utils/array-unique');
const { MAX_CONCURRENT } = require('./constants');
const eachLimit = require('async/eachLimit');
const debug = require('debug');

function diveObject(currentKey, src, dst) {
	return Object.entries(src).reduce((acc, [key, value]) => {
		if (currentKey) {
			key = `${currentKey}.${key}`;
		}

		if (typeof value === 'object') {
			diveObject(key, value, acc);
		} else {
			acc[key] = value;
		}

		return acc;
	}, dst);
}

function flatObject(obj) {
	return diveObject(null, obj, {});
}

function intersection(a, b) {
	return a.filter((v) => b.includes(v));
}

function inflate(obj, key, value) {
	const list = key.split('.');
	let current = obj;

	list.forEach((nested, idx) => {
		if (idx === list.length - 1) {
			current[nested] = value;
			return;
		}

		if (!current[nested]) {
			current[nested] = {};
		}

		current = current[nested];
	});
}

function inflateObject(obj) {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		inflate(acc, key, value);

		return acc;
	}, {});
}

function filterObject(obj, keys) {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (keys.includes(key)) {
			acc[key] = value;
		}

		return acc;
	}, {});
}

module.exports = class SplitTranslations extends TrackingWriter {
	constructor(inputNodes, options) {
		options = Object.assign({
			annotation: 'ember-cli-intl-shake:split-translations',
			literalsFile: 'intl-literals.json',
			translationsDir: 'translations',
			persistentOutput: true
		}, options);

		options.cacheInclude = [
			/intl-literals\.json$/,
			new RegExp(`${options.translationsDir}\/.+\.json$`)
		];

		super(inputNodes, options);

		this._debug = debug(options.annotation);
		this.isLiteral = options.cacheInclude[0];
		this.isTranslation = options.cacheInclude[1];
		this.literalsFile = options.literalsFile;
		this.translationsDir = options.translationsDir;
		this.translations = {};
	}

	getLiteralsFiles() {
		return this.listEntries()
			.filter((entry) => entry.relativePath.match(this.isLiteral))
			.map((entry) => entry.relativePath);
	}

	getTranslationsFiles() {
		return this.listEntries()
			.filter((entry) => entry.relativePath.match(this.isTranslation))
			.map((entry) => entry.relativePath);
	}

	extractPairs(changes) {
		this.debug('extracting pairs...');

		const literals = this.getLiteralsFiles();
		const translations = this.getTranslationsFiles();
		const pairs = changes.reduce((acc, change) => {
			if (change.match(this.isLiteral)) {
				acc.push(...translations.map((translation) => [change, translation].join(':')));
			} else {
				acc.push(...literals.map((literal) => [literal, change].join(':')));
			}

			return acc;
		}, []);

		return arrayUnique(pairs).map((pair) => pair.split(':'));
	}

	async getFile(relativePath) {
		const entries = this.listEntries();
		const entry = entries.find((e) => e.relativePath === relativePath);
		const content = await readFile(path.join(entry.basePath, entry.relativePath));
		const json = JSON.parse(content);

		return json;
	}

	async getLiterals(relativePath) {
		if (this.filesCache[relativePath]) {
			return this.filesCache[relativePath];
		}

		const literals = await this.getFile(relativePath);

		this.filesCache[relativePath] = literals;

		return literals;
	}

	async getTranslations(relativePath) {
		if (this.filesCache[relativePath]) {
			return this.filesCache[relativePath];
		}

		const translations = await this.getFile(relativePath);
		const flattenTranslations = flatObject(translations);

		this.filesCache[relativePath] = flattenTranslations;

		return flattenTranslations;
	}

	async processPair([literalsPath, translationsPath]) {
		const module = path.dirname(literalsPath);
		const locale = path.basename(translationsPath, path.extname(translationsPath));

		this.debug(`processing '${module}:${locale}'...`);

		const literals = await this.getLiterals(literalsPath);
		const translations = await this.getTranslations(translationsPath);
		const translationKeys = Object.keys(translations);
		const moduleKeys = intersection(translationKeys, literals);
		const moduleTranslations = inflateObject(filterObject(translations, moduleKeys));
		const moduleContent = JSON.stringify(moduleTranslations);
		const filename = path.join(this.outputPath, 'translations', module, `${locale}.json`);

		if (await shouldWriteFile(filename, moduleContent)) {
			await writeFile(filename, moduleContent);
		}
	}

	async processFiles(changes) {
		this.filesCache = {};
		this.intersectionsCache = {};

		changes = changes.map((entry) => entry.relativePath);

		const pairs = this.extractPairs(changes);

		await eachLimit(pairs, MAX_CONCURRENT, this.processPair.bind(this));
	}
};
