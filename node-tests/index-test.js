const { assert } = require('chai');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { exec } = require('child_process');
const util = require('util');

const TEST_TIMEOUT = 180000;
const rootPath = path.resolve(__dirname, '..');
const emberCLIPath = path.resolve(rootPath, 'node_modules/ember-cli/bin/ember');
const fileExists = util.promisify(fs.access);
const readFile = util.promisify(fs.readFile);
const remove = util.promisify(rimraf);

// Disables persist filter cache.
process.env.CI = true;

function runEmberCommand(packagePath, command) {
  return new Promise((resolve, reject) => {
    exec(
      `${emberCLIPath} ${command}`,
      {
        cwd: packagePath,
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function cleanup(packagePath) {
  await Promise.all([
    remove(path.join(packagePath, 'dist')),
    remove(path.join(packagePath, 'tmp')),
  ]);
}

function outputFilePath(...files) {
  return path.join(rootPath, 'dist', ...files);
}

async function assertFileExists(filePath) {
  try {
    await fileExists(filePath);

    assert.ok(true, `${filePath} exists`);
  } catch (e) {
    assert.ok(false, `${filePath} exists`);
  }
}

async function assertContains(filePath, prop, val) {
  const fileContent = await readFile(filePath, 'utf8');
  const fileObject = JSON.parse(fileContent);

  assert.deepNestedPropertyVal(
    fileObject,
    prop,
    val,
    `${filePath} contains ${prop} with ${val}`
  );
}

async function assertNotContains(filePath, prop) {
  const fileContent = await readFile(filePath, 'utf8');
  const fileObject = JSON.parse(fileContent);

  assert.notNestedProperty(
    fileObject,
    prop,
    `${filePath} not contains ${prop}`
  );
}

describe('When addon is enabled', function () {
  this.timeout(TEST_TIMEOUT);

  before(async () => {
    await cleanup(rootPath);
    await runEmberCommand(rootPath, 'build');
  });

  context('and translations are centralized on app', () => {
    it('generates translations file for app', async () => {
      const translationFile = outputFilePath('translations', 'en-gb.json');

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'dummy.template', 'Template');
      await assertContains(translationFile, 'dummy.javascript', 'Javascript');
      await assertContains(translationFile, 'dummy.json', 'JSON');
      await assertContains(translationFile, 'dummy.directories', 'Directories');
      await assertContains(translationFile, 'dummy.with', 'With');
      await assertContains(translationFile, 'dummy.inflection.one', 'Singular');
      await assertContains(translationFile, 'dummy.inflection.other', 'Plural');
      await assertContains(translationFile, 'common.javascript', 'Javascript');
      await assertNotContains(translationFile, 'dummy.missing');
    });

    it('generates translations file for addons', async () => {
      const translationFile = outputFilePath('translations', 'en-gb.json');

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'dummy-addon.template', 'Template');
      await assertContains(
        translationFile,
        'dummy-addon.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'dummy-addon.json', 'JSON');
      await assertNotContains(translationFile, 'dummy-addon.missing');
    });

    it('generates translations file for eager engines', async () => {
      const translationFile = outputFilePath('translations', 'en-gb.json');

      await assertFileExists(translationFile);
      await assertContains(
        translationFile,
        'eager-engine.template',
        'Template'
      );
      await assertContains(
        translationFile,
        'eager-engine.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'eager-engine.json', 'JSON');
      await assertNotContains(translationFile, 'eager-engine.missing');
    });

    it('generates translations file for lazy engines', async () => {
      const translationFile = outputFilePath(
        'engines-dist',
        '@lazy',
        'engine',
        'translations',
        'en-gb.json'
      );

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'lazy-engine.template', 'Template');
      await assertContains(
        translationFile,
        'lazy-engine.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'lazy-engine.json', 'JSON');
      await assertContains(translationFile, 'common.javascript', 'Javascript');
      await assertNotContains(translationFile, 'lazy-engine.missing');
    });
  });

  context('and translations are distributed on addons and engines', () => {
    it('generates translations file for app', async () => {
      const translationFile = outputFilePath('translations', 'en-us.json');

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'dummy.template', 'Template');
      await assertContains(translationFile, 'dummy.javascript', 'Javascript');
      await assertContains(translationFile, 'dummy.json', 'JSON');
      await assertContains(translationFile, 'dummy.directories', 'Directories');
      await assertContains(translationFile, 'dummy.with', 'With');
      await assertContains(translationFile, 'dummy.inflection.one', 'Singular');
      await assertContains(translationFile, 'dummy.inflection.other', 'Plural');
      await assertContains(translationFile, 'common.javascript', 'Javascript');
      await assertNotContains(translationFile, 'dummy.missing');
    });

    it('generates translations file for addons', async () => {
      const translationFile = outputFilePath('translations', 'en-us.json');

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'dummy-addon.template', 'Template');
      await assertContains(
        translationFile,
        'dummy-addon.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'dummy-addon.json', 'JSON');
      await assertNotContains(translationFile, 'dummy-addon.missing');
    });

    it('generates translations file for eager engines', async () => {
      const translationFile = outputFilePath('translations', 'en-us.json');

      await assertFileExists(translationFile);
      await assertContains(
        translationFile,
        'eager-engine.template',
        'Template'
      );
      await assertContains(
        translationFile,
        'eager-engine.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'eager-engine.json', 'JSON');
      await assertNotContains(translationFile, 'eager-engine.missing');
    });

    it('generates translations file for lazy engines', async () => {
      const translationFile = outputFilePath(
        'engines-dist',
        '@lazy',
        'engine',
        'translations',
        'en-us.json'
      );

      await assertFileExists(translationFile);
      await assertContains(translationFile, 'lazy-engine.template', 'Template');
      await assertContains(
        translationFile,
        'lazy-engine.javascript',
        'Javascript'
      );
      await assertContains(translationFile, 'lazy-engine.json', 'JSON');
      await assertContains(translationFile, 'common.javascript', 'Javascript');
      await assertNotContains(translationFile, 'lazy-engine.missing');
    });
  });
});
