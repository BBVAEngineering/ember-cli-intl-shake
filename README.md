# ember-cli-intl-shake

[![Build Status](https://travis-ci.com/BBVAEngineering/ember-cli-intl-shake.svg?branch=master)](https://travis-ci.com/BBVAEngineering/ember-cli-intl-shake)
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-intl-shake.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-intl-shake)
[![NPM version](https://badge.fury.io/js/ember-cli-intl-shake.svg)](https://badge.fury.io/js/ember-cli-intl-shake)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-cli-intl-shake.svg)](https://david-dm.org/BBVAEngineering/ember-cli-intl-shake)
[![codecov](https://codecov.io/gh/BBVAEngineering/ember-cli-intl-shake/branch/master/graph/badge.svg)](https://codecov.io/gh/BBVAEngineering/ember-cli-intl-shake)
[![Greenkeeper badge](https://badges.greenkeeper.io/BBVAEngineering/ember-cli-intl-shake.svg)](https://greenkeeper.io/)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-intl-shake.svg)](https://emberobserver.com/addons/ember-cli-intl-shake)

## Information

[![NPM](https://nodei.co/npm/ember-cli-intl-shake.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-cli-intl-shake/)

Tree-shakes internationalization files reading literals from app and engine files.

I18n from engines are splitted in its own files.

If you are using [`ember-intl`](https://github.com/ember-intl/ember-intl) addon, remember to enable `publicOnly` option to be able to output i18n files to a folder.

## Installation

```
ember install ember-cli-intl-shake
```

## Usage

The addon options can be configured in `ember-cli-build.js`.

**Example config:**

```js
'ember-cli-intl-shake': {
  translationsDir: 'translations',
}
```

## Options

### `translationsDir`

type: `String`
default: `translations`

Output directory where to find current i18n files.

### `addons.include`

type: `Array`
default: `undefined`

Addons to include in the literal shake (`String` or `RegExp`).

### `addons.exclude`

type: `Array`
default: `undefined`

Addons to exclude from the literal shake (`String` or `RegExp`).

### `files.include`

type: `Array`
default: `undefined`

Files to include in the literal shake.

### `files.exclude`

type: `Array`
default: `undefined`

Files to exclude from the literal shake.

### `directories.include`

type: `Array`
default: `undefined`

Directories to include in the literal shake to the app module.

### `filters`

type: `Array`
default:

```json
[{
  extensions: ['js'],
  filter: require('./lib/filters/javascript')
}, {
  extensions: ['hbs'],
  filter: require('./lib/filters/handlebars')
}, {
  extensions: ['json'],
  filter: require('./lib/filters/json')
}]
```

Filters and extensions to filter literals to shake translation files.

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-cli-intl-shake/tags).

## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-cli-intl-shake/graphs/contributors) who participated in this project.

## License

This project is licensed under the [MIT License](LICENSE.md).
