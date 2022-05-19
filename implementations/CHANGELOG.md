# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.1.0](https://github.com/ERC725Alliance/ERC725/compare/v2.2.0...v3.1.0) (2022-05-19)


### Features

* getData and setData overloading  ([#93](https://github.com/ERC725Alliance/ERC725/issues/93)) ([014c41e](https://github.com/ERC725Alliance/ERC725/commit/014c41e342db5b1e1c5880d5fd81a66841617529))


### Bug Fixes

* check contract balance against provided `_value` to `erc725X.execute(...)` ([#102](https://github.com/ERC725Alliance/ERC725/issues/102)) ([8a96bcc](https://github.com/ERC725Alliance/ERC725/commit/8a96bcc56e447ba8064630a59a04f33c9ec0c0dc)), closes [#78](https://github.com/ERC725Alliance/ERC725/issues/78)
* check for zero value with staticcall and delegatecall ([#108](https://github.com/ERC725Alliance/ERC725/issues/108)) ([9fb6b1d](https://github.com/ERC725Alliance/ERC725/commit/9fb6b1d3b06fdefa5f4eafaf66e7b91e4ca14af9))
* inherit most base to most derived ([#107](https://github.com/ERC725Alliance/ERC725/issues/107)) ([70d3b67](https://github.com/ERC725Alliance/ERC725/commit/70d3b67af494e7a5f74ae033a7436f9766a1cb98))
* mark initialize(...) as internal for onlyInitializing ([#88](https://github.com/ERC725Alliance/ERC725/issues/88)) ([2fd43ef](https://github.com/ERC725Alliance/ERC725/commit/2fd43ef09547202590f79c524470a174ca7bd60e))
