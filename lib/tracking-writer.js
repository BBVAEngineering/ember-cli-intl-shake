'use strict';

const CachingWriter = require('broccoli-caching-writer');
const FSTree = require('fs-tree-diff');

module.exports = class TrackingWriter extends CachingWriter {
  constructor(inputNodes, options) {
    options = Object.assign(
      {
        annotation: 'ember-cli-intl-shake:reducer',
        persistentOutput: true,
      },
      options
    );

    super(inputNodes, options);
  }

  async build() {
    let entries = this.listEntries();
    const currentTree = FSTree.fromEntries(entries);

    if (this._lastTree) {
      const patch = this._lastTree.calculatePatch(currentTree);

      entries = patch.map(([, , entry]) => entry);
    }

    this._lastTree = currentTree;

    await this.processFiles(entries);
  }

  async processFiles() {
    throw new Error(
      'You must implement the `processFiles()` method of the Reducer plugin'
    );
  }
};
