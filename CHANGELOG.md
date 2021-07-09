# [2.3.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v2.2.0...v2.3.0) (2021-07-09)


### Features

* improve performance for large apps ([c1ec3ee](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/c1ec3eef9e8f310bd218fdbe373373858829b6e9))

# [2.2.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v2.1.1...v2.2.0) (2021-07-07)


### Features

* add stream deps ([ea40a0f](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/ea40a0f725387c945363a949079f9fe4adca1fde))
* allow RegExp to filter addons ([d8dba02](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/d8dba02d8285ad179873910213f4c83c25e9cf81))
* prevent storing file content in memory ([7727c23](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/7727c23d5b5d14bc257a9d85d091a4f24a31a26e))
* use workers to reduce-literals ([548faeb](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/548faeb6dfa49948260d10e26c1cc1eb0f8109fd))
* use workers to split-translations ([63862ff](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/63862ffc956b6b60853e98128171e8c5f982b20b))

## [2.1.1](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v2.1.0...v2.1.1) (2020-04-28)


### Bug Fixes

* minimize built trees from addons ([5db7117](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/5db71178a817808b6dfbdaf45a8f4d22a9636cea))

# [2.1.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v2.0.0...v2.1.0) (2020-03-02)


### Features

* **reduce-literals:** do not group same literals on app translations ([d2c6ddb](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/d2c6ddbdc0029d9b92ac0136b136d30572c14a49))

# [2.0.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.2.0...v2.0.0) (2020-02-21)


### Features

* **split-translations:** respect same translations directory as source ([38ff7c5](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/38ff7c55afabe42b5e828bf1e6e39695cf512374))


### BREAKING CHANGES

* **split-translations:** Destination files had been changed.

# [1.2.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.1.0...v1.2.0) (2020-02-03)


### Features

* allow namespaces as addon / engine name ([52eeae2](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/52eeae28b6a2570850588d6f08b6afe59e91efd3))

# [1.1.0](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.0.4...v1.1.0) (2020-01-30)


### Bug Fixes

* **split:** fix support for i18n pluralized literals ([d8c1bd6](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/d8c1bd6068036ead76019d204e52980791f10580))


### Features

* **reduce:** extract common literals to the app output json ([3c0bce4](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/3c0bce4e8a192eb6ef5b3e8ee25a6fa3e6cddc59))


### Performance Improvements

* **reduce:** filter out all literals not matching at least two words ([584876e](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/584876e46751aea4935417a0d6fbbfc8a9b4d4a0))

## [1.0.4](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.0.3...v1.0.4) (2020-01-28)


### Bug Fixes

* **package:** move ember-addon to dev dependency ([fcb0fd0](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/fcb0fd054797d59e45755a066b81f71d4e10cd72))

## [1.0.3](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.0.2...v1.0.3) (2020-01-28)


### Bug Fixes

* **filter:** change parser from acorn to babel ([8d955de](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/8d955dea7bdd181334f68b9f71de7ea114c36388))
* **package:** drop node 8 support ([c73d726](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/c73d726c0d173c18ec41f70decc1a3c4390b686c))

## [1.0.2](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.0.1...v1.0.2) (2020-01-24)


### Bug Fixes

* **split-literals:** check partial literals from translations ([1ba3a82](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/1ba3a827771922be2e8597c574f9f63b7315ebfd))

## [1.0.1](https://github.com/BBVAEngineering/ember-cli-intl-shake/compare/v1.0.0...v1.0.1) (2019-11-13)


### Bug Fixes

* **write-file:** use mkdirp from fs-extra ([d710ae9](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/d710ae931840ef35f704b190197df56dbb32bdc2))

# 1.0.0 (2019-11-12)


### Bug Fixes

* **package:** order addon before asset-rev ([1e03982](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/1e03982ebb7e730b5444b47b6abbd5d635e44169))


### Features

* **filter:** add options to add new filters ([87c8a33](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/87c8a3385193a25edfee6b7f37664a4a69497360))
* initial code ([3b2db8a](https://github.com/BBVAEngineering/ember-cli-intl-shake/commit/3b2db8ad39ee7744b3409777b0cbe71772b4a194))
