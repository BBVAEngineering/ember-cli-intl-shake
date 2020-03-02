'use strict';

const MergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const buildTree = require('./lib/build-tree');
const FilterLiterals = require('./lib/filter-literals');
const ReduceLiterals = require('./lib/reduce-literals');
const SplitTranslations = require('./lib/split-translations');
const WatchedDir = require('broccoli-source').WatchedDir;

module.exports = {
	name: require('./package').name,

	isDevelopingAddon() {
		return true;
	},

	included() {
		this._super.included.apply(this, arguments);

		this.app = this._findHost();
		this.options = Object.assign({
			filters: [{
				extensions: ['js'],
				filter: require('./lib/filters/javascript')
			}, {
				extensions: ['hbs'],
				filter: require('./lib/filters/handlebars')
			}, {
				extensions: ['json'],
				filter: require('./lib/filters/json')
			}],
			files: {},
			addons: {},
			translationsDir: 'translations'
		}, this.app.options['ember-cli-intl-shake']);
	},

	getExtensions() {
		return this.options.filters.reduce((acc, filter) => [...acc, ...filter.extensions], []);
	},

	postprocessTree(type, tree) {
		if (type !== 'all') {
			return tree;
		}

		const trees = buildTree(this.app, this.treeGenerator, this.options);
		const modules = [this.app.name, ...this.app.project.addons.map((addon) => addon.name)];

		if (this.options.directories && this.options.directories.include) {
			trees.push(...this.options.directories.include.map((directory) =>
				new Funnel(new WatchedDir(directory), {
					destDir: this.app.name,
					annotation: `ember-cli-intl-shake:build-tree:${directory}`
				})));
		}

		const includeExtensions = this.getExtensions().map((extension) => `**/*.${extension}`);

		let intlTree = new Funnel(new MergeTrees(trees, { overwrite: true }), { include: includeExtensions });

		intlTree = new Funnel(intlTree, {
			include: this.options.files.include,
			exclude: this.options.files.exclude
		});

		intlTree = new FilterLiterals(intlTree, {
			filters: this.options.filters
		});

		intlTree = new ReduceLiterals([intlTree], {
			modules
		});

		intlTree = new SplitTranslations([tree, intlTree], {
			translationsDir: this.options.translationsDir,
			common: this.app.name
		});

		tree = new Funnel(tree, { exclude: [`${this.options.translationsDir}/**/*.json`] });

		return new MergeTrees([tree, intlTree], { overwrite: true });
	}
};
