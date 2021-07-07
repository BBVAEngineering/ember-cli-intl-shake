'use strict';

const TrackingWriter = require('./tracking-writer');
const arrayUnique = require('./utils/array-unique');
const debug = require('debug');
const path = require('path');
const workerpool = require('workerpool');

module.exports = class SplitTranslations extends TrackingWriter {
	constructor(inputNodes, options) {
		options = Object.assign({
			annotation: 'ember-cli-intl-shake:split-translations',
			literalsFile: 'intl-literals.json',
			translationsDir: 'translations',
			common: null,
			persistentOutput: true
		}, options);

		options.cacheInclude = [
			/intl-literals\.json$/,
			new RegExp(`${options.translationsDir}\\/.+\\.json$`)
		];

		super(inputNodes, options);

		this._debug = debug(options.annotation);
		this.isLiteral = options.cacheInclude[0];
		this.isTranslation = options.cacheInclude[1];
		this.literalsFile = options.literalsFile;
		this.translationsDir = options.translationsDir;
		this.common = options.common;
		this.translations = {};
		this.pool = workerpool.pool(
			path.join(__dirname, 'workers/split-translations.js')
		);
	}

	getLiteralsFiles(entries) {
		return entries
			.filter((entry) => entry.relativePath.match(this.isLiteral))
			.map((entry) => entry.relativePath);
	}

	getTranslationsFiles(entries) {
		return entries
			.filter((entry) => entry.relativePath.match(this.isTranslation))
			.map((entry) => entry.relativePath);
	}

	extractPairs(changes, entries) {
		this.debug('extracting pairs...');

		const literals = this.getLiteralsFiles(entries);
		const translations = this.getTranslationsFiles(entries);
		const pairs = changes.reduce((acc, change) => {
			if (change.match(this.isLiteral)) {
				const module = this.getModuleFromLiteral(change);
				const moduleTranslations = this.getTranslationsByModule(translations, module);

				acc.push(...moduleTranslations.map((translation) => [change, translation].join(':')));
			} else {
				const module = this.getModuleFromTranslation(change);
				const moduleLiterals = this.getLiteralsByModule(literals, module);

				acc.push(...moduleLiterals.map((literal) => [literal, change].join(':')));
			}

			return acc;
		}, []);

		return arrayUnique(pairs).map((pair) => pair.split(':'));
	}

	getTranslationsByModule(translations, module) {
		if (module === this.common) {
			const regexp = new RegExp(`^${this.translationsDir}/.+\\.json$`);

			return translations.filter((translation) => regexp.test(translation));
		}

		return translations.filter((translation) => translation.match(module));
	}

	getLiteralsByModule(literals, module) {
		return literals.filter((literal) => literal.match(module));
	}

	// Examples:
	//  - dummy/intl-literals.json
	//  - @lazy/engine/intl-literals.json
	getModuleFromLiteral(file) {
		const regexp = new RegExp(`^(.+)/${this.literalsFile}$`);
		const matches = regexp.exec(file);

		return matches && matches[1];
	}

	// Examples:
	//  - translations/en-gb.json
	//  - engines-dist/@lazy/engine/translations/en-gb.json
	getModuleFromTranslation(file) {
		const regexp = /^engines-dist\/(.+)\/translations\/.+\.json$/;
		const matches = regexp.exec(file);

		return matches ? matches[1] : this.common;
	}

	async processFiles(changes) {
		changes = changes.map((entry) => entry.relativePath);

		const entries = this.listEntries();
		const pairs = this.extractPairs(changes, entries);
		const tasks = pairs.map(([literalsPath, translationsPath]) =>
			this.pool.exec('processPair', [this.outputPath, entries, literalsPath, translationsPath])
		);

		await Promise.all(tasks);
	}
};
