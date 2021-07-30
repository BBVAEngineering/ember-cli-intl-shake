const workerpool = require('workerpool');
const path = require('path');
const debug = require('debug')('reduce-literals-worker');
const LRU = require('lru-cache');
const readF = require('../utils/read-file');
const writeF = require('../utils/write-file');
const shouldWriteF = require('../utils/should-write-file');

const JOIN_TOKEN = '\u0010';
const cache = new LRU();

function inflate(obj, key, value) {
  const list = key.split('.');
  let current = obj;

  list.forEach((nested, idx) => {
    nested = nested.replace(JOIN_TOKEN, '.');

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

function diveObject(currentKey, src, dst) {
  return Object.entries(src).reduce((acc, [key, value]) => {
    key = key.replace('.', JOIN_TOKEN);

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
  // TODO: change this when we drop support for legacy i18n pluralization.
  // return a.filter((v) => b.includes(v));
  return a.filter((v) => b.includes(v.replace(/\.(one|other)$/, '')));
}

async function processPair(
  outputPath,
  entries,
  literalsPath,
  translationsPath
) {
  const module = path.dirname(literalsPath);
  const locale = path.basename(
    translationsPath,
    path.extname(translationsPath)
  );

  debug(`processing '${module}:${locale}'...`);

  const literals = await getLiterals(entries, literalsPath);
  const translations = await getTranslations(entries, translationsPath);
  const translationKeys = Object.keys(translations);
  const moduleKeys = intersection(translationKeys, literals);
  const moduleTranslations = inflateObject(
    filterObject(translations, moduleKeys)
  );
  const moduleContent = JSON.stringify(moduleTranslations);
  const filename = path.join(outputPath, translationsPath);

  if (await shouldWriteF(filename, moduleContent)) {
    await writeF(filename, moduleContent);
  }
}

async function getLiterals(entries, relativePath) {
  const cachedData = cache.get(relativePath);

  if (cachedData) {
    return cachedData;
  }

  const literals = await getFile(entries, relativePath);

  cache.set(relativePath, literals);

  return literals;
}

async function getTranslations(entries, relativePath) {
  const cachedData = cache.get(relativePath);

  if (cachedData) {
    return cachedData;
  }

  const translations = await getFile(entries, relativePath);
  const flattenTranslations = flatObject(translations);

  cache.set(relativePath, flattenTranslations);

  return flattenTranslations;
}

async function getFile(entries, relativePath) {
  const entry = entries.find((e) => e.relativePath === relativePath);
  const content = await readF(path.join(entry.basePath, entry.relativePath));
  const json = JSON.parse(content);

  return json;
}

workerpool.worker({
  processPair,
});
