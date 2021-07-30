'use strict';

const path = require('path');
const fs = require('fs');
const WatchedDir = require('broccoli-source').WatchedDir;
const Funnel = require('broccoli-funnel');
const processModuleCache = require('./utils/module-cache');

function generateAddonTree(addon, treePath, moduleName, treeGenerator) {
  const fullPath = path.join(addon.root, addon.treePaths[treePath]);
  const tree = treeGenerator.call(addon, fullPath);

  return new Funnel(tree, {
    destDir: path.join(moduleName, addon.treePaths[treePath]),
  });
}

function hasTreePath(addon, treePath) {
  try {
    if (addon.treePaths && addon.treePaths[treePath]) {
      // eslint-disable-next-line no-sync
      fs.accessSync(path.join(addon.root, addon.treePaths[treePath]));

      return true;
    }
  } catch (e) {
    // noop.
  }

  return false;
}

/* eslint-disable complexity */
function processAddon(addon, parentName, treeGenerator, options) {
  const trees = [];
  const isLazyLoad = addon.lazyLoading && addon.lazyLoading.enabled;
  const moduleName = isLazyLoad
    ? addon.name
    : path.join(parentName, addon.name);

  if (shouldBeProcessed(addon, options)) {
    if (!processModuleCache[addon.name]) {
      if (hasTreePath(addon, 'addon')) {
        trees.push(
          generateAddonTree(addon, 'addon', addon.name, treeGenerator)
        );
      }

      if (hasTreePath(addon, 'app')) {
        trees.push(generateAddonTree(addon, 'app', addon.name, treeGenerator));
      }

      processModuleCache.add(addon.name, addon.name);
    }

    // !isLazyLoad: We don't want engine literals in the root app.
    if (!isLazyLoad && parentName) {
      processModuleCache.add(parentName, parentName);
      processModuleCache.add(parentName, addon.name);
    }
  }

  trees.push(
    ...processAddons(
      addon.addons,
      isLazyLoad ? moduleName : parentName,
      treeGenerator,
      options
    )
  );

  return trees;
}
/* eslint-enable complexity */

function processAddons(addons, parentName, treeGenerator, options) {
  return addons.reduce(
    (acc, addon) => [
      ...acc,
      ...processAddon(addon, parentName, treeGenerator, options),
    ],
    []
  );
}

function getAppTree(app) {
  if (typeof app.trees.app === 'string') {
    const appPath = path.join(app.project.root, app.trees.app);

    return new WatchedDir(appPath);
  }

  return app.trees.app;
}

function shouldBeProcessed(addon, options) {
  const include = options.addons && options.addons.include;
  const exclude = options.addons && options.addons.exclude;
  let shouldBe = true;

  if (include) {
    shouldBe = include.some((matcher) => {
      if (typeof matcher === 'object' && matcher.test) {
        return matcher.test(addon.name);
      }

      return matcher === addon.name;
    });
  }

  if (shouldBe && exclude) {
    shouldBe = !exclude.some((matcher) => {
      if (typeof matcher === 'object' && matcher.test) {
        return matcher.test(addon.name);
      }

      return matcher === addon.name;
    });
  }

  if (shouldBe) {
    shouldBe = Boolean(
      addon.addonPackages && addon.addonPackages['ember-intl']
    );
  }

  return shouldBe;
}

/*
 * Returns a tree with all the included addon files.
 *
 * Example for `ember-addon-foo`:
 * - /services/foo.js
 */
module.exports = function buildTree(app, treeGenerator, options) {
  const appTree = getAppTree(app);
  const trees = processAddons(
    app.project.addons,
    app.name,
    treeGenerator,
    options
  );

  trees.push(
    new Funnel(appTree, {
      destDir: app.name,
      annotation: `ember-cli-intl-shake:build-tree:${app.name}`,
    })
  );

  return {
    trees,
    modules: processModuleCache.normalize(),
  };
};
