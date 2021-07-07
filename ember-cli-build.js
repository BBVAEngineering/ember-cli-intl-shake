'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
	const app = new EmberAddon(defaults, {
		'ember-cli-intl-shake': {
			addons: {
				include: [
					'dummy-addon',
					'eager-engine',
					/^@lazy/,
				],
				exclude: [
					/foo/
				]
			},
			directories: {
				include: [
					'tests/dummy/literals'
				]
			},
			files: {
				exclude: [
					/excluded-translations.json/
				]
			}
		}
	});

	/*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

	return app.toTree();
};
