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
			files: {},
			addons: {},
			translationsDir: 'translations'
		}, this.app.options['ember-cli-intl-shake']);
	},

	postprocessTree(type, tree) {
		if (type !== 'all') {
			return tree;
		}

		const trees = buildTree(this.app, this.treeGenerator, this.options);

		if (this.options.directories && this.options.directories.include) {
			trees.push(...this.options.directories.include.map((directory) =>
				new Funnel(new WatchedDir(directory), {
					destDir: this.app.name,
					annotation: `ember-cli-intl-shake:build-tree:${directory}`
				})));
		}

		let intlTree = new Funnel(new MergeTrees(trees, { overwrite: true }), { include: ['**/*.js', '**/*.json', '**/*.hbs'] });

		intlTree = new Funnel(intlTree, {
			include: this.options.files.include,
			exclude: this.options.files.exclude
		});

		intlTree = new FilterLiterals(intlTree);

		intlTree = new ReduceLiterals([intlTree]);

		intlTree = new SplitTranslations([tree, intlTree], { translationsDir: this.options.translationsDir });

		tree = new Funnel(tree, { exclude: [`${this.options.translationsDir}/**/*.json`] });

		return new MergeTrees([tree, intlTree], { overwrite: true });
	}
};
