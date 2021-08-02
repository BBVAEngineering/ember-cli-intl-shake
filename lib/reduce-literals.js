'use strict';

const path = require('path');
const CachingWriter = require('broccoli-caching-writer');
const debug = require('debug');
const workerpool = require('workerpool');

/*
 * {
 *   '@lazy/engine': [
 *     '<ABS_PATH>/@lazy/engine/addon/engine.js.intl.json',
 *     '<ABS_PATH>/@lazy/engine/addon/resolver.js.intl.json',
 *     ...
 *   ]
 *   dummy: [
 *     '<ABS_PATH>/dummy-addon/addon/components/addon-component.js.intl.json',
 *     ...
 *   ],
 *   ...
 * }
 */
function groupByModule(entries, modules) {
  const moduleEntries = Object.entries(modules);
  const acc = {};

  for (const entry of entries) {
    const relativePath = entry.relativePath;

    for (const [moduleName, dependencies] of moduleEntries) {
      const isIncluded = dependencies.some((dependency) =>
        relativePath.startsWith(dependency)
      );

      if (isIncluded) {
        const entryAbsPath = path.join(entry.basePath, relativePath);

        acc[moduleName] = acc[moduleName] || [];
        acc[moduleName].push(entryAbsPath);
      }
    }
  }

  return acc;
}

/*
 * Merges all possible literals of a module.
 *
 * Example for:
 * - `dummy-addon/addon/components/addon-component.js.intl.json`
 * - `dummy/app/routes/applicationn.js.intl.json`
 * - `@lazy/engine/addon/routes/applicationn.js.intl.json`
 *
 * Outputs:
 * - `@lazy/engine/translations/intl-literals.json`
 * - `dummy/translations/intl-literals.json`
 *
 * > Each output file contains an Array with all the literals of the module.
 */
module.exports = class ReduceLiterals extends CachingWriter {
  constructor(inputNodes, options) {
    options = Object.assign(
      {
        outputFile: 'intl-literals.json',
        annotation: 'ember-cli-intl-shake:reduce-literals',
        cacheInclude: [/\.intl\.json$/],
        modules: [],
        persistentOutput: true,
      },
      options
    );

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
      pool.exec('writeModule', [
        this.outputPath,
        this.outputFile,
        module,
        paths,
      ])
    );

    await Promise.all(tasks);
    pool.terminate();
  }
};
