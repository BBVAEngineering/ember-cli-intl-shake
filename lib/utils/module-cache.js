'use strict';

/*
	'@namespace/foo': ['@namespace/foo', 'addon-1', 'addon-2'],
	'addon-1': ['addon-1', 'addon-3'],
	'addon-2': ['addon-2'],
	'addon-3': ['addon-3'],
*/
const CACHE = {};

function setNonEnumerable(obj, prop, value) {
  Object.defineProperty(obj, prop, {
    enumerable: false,
    value,
  });
}

setNonEnumerable(CACHE, 'add', function add(key, value) {
  this[key] = this[key] || [];

  if (value) {
    this[key].push(value);
    this[key] = [...new Set(this[key])];
  }
});

setNonEnumerable(CACHE, 'normalize', function normalize() {
  const acc = {};
  const moduleEntries = Object.entries(this).sort(
    (a, b) => a[1].length - b[1].length
  );

  // Remove modules that are dependencies
  for (const [module, dependencies] of moduleEntries) {
    const isDependency = moduleEntries.some(
      ([mod, deps]) => mod !== module && deps.includes(module)
    );

    if (!isDependency) {
      acc[module] = dependencies;
    }
  }

  return acc;
});

module.exports = CACHE;
