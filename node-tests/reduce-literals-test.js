'use strict';

const { assert } = require('chai');
const { createBuilder, createTempDir } = require('broccoli-test-helper');
const Funnel = require('broccoli-funnel');
const ReduceLiterals = require('../lib/reduce-literals');

describe('ReduceLiterals', () => {
  let input, builder, modules;

  beforeEach(async () => {
    input = await createTempDir();
    input.write({
      dummy: {
        'a.intl.json': JSON.stringify(['label.a', 'label.a']),
        dir: {
          'ab.intl.json': JSON.stringify(['label.a', 'label.b']),
          'ad.intl.json': JSON.stringify(['label.a', 'label.d']),
        },
      },
      another: {
        folder: {
          'c.intl.json': JSON.stringify(['label.c']),
          'd.intl.json': JSON.stringify(['label.d']),
        },
      },
    });

    modules = {
      dummy: ['dummy'],
      'another/folder': ['another/folder'],
    };
  });

  afterEach(async () => {
    await input.dispose();
    await builder.dispose();
  });

  context('when built for first time', () => {
    it('reduce literals for each module', async () => {
      const tree = new Funnel(input.path());
      const plugin = new ReduceLiterals([tree], { modules });

      builder = createBuilder(plugin);

      await builder.build();

      const files = builder.read();

      assert.equal(
        files.dummy['intl-literals.json'],
        JSON.stringify(['label.a', 'label.b', 'label.d'])
      );
      assert.equal(
        files.another.folder['intl-literals.json'],
        JSON.stringify(['label.c', 'label.d'])
      );
    });
  });

  context('when building', () => {
    it('reduce literals for each module', async () => {
      const tree = new Funnel(input.path());
      const plugin = new ReduceLiterals([tree], { modules });

      builder = createBuilder(plugin);

      await builder.build();

      input.write({
        dummy: {
          'a.intl.json': JSON.stringify(['label.a', 'label.b']),
        },
      });

      await builder.build();

      const files = builder.read();

      assert.equal(
        files.dummy['intl-literals.json'],
        JSON.stringify(['label.a', 'label.b', 'label.d'])
      );
      assert.equal(
        files.another.folder['intl-literals.json'],
        JSON.stringify(['label.c', 'label.d'])
      );
    });
  });
});
