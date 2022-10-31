# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 4.0.0 (2022-10-31)


### ⚠ BREAKING CHANGES

* replace error strings by custom errors + use `enum` for `OPERATION_TYPE` (#175)
* add `bytes dataValue` parameter to `DataChanged` event in ERC725Y (#163)
* remove `owner()` check for delegatecall + add WARNING comment (#119)

### Features

* add `bytes dataValue` parameter to `DataChanged` event in ERC725Y ([#163](https://github.com/ERC725Alliance/ERC725/issues/163)) ([93447de](https://github.com/ERC725Alliance/ERC725/commit/93447def047abab2ad81b365b9e8c1441507f9ae))
* Add `MappAndArrayKey` functions to `ERC725Utils` lib ([#74](https://github.com/ERC725Alliance/ERC725/issues/74)) ([f011b59](https://github.com/ERC725Alliance/ERC725/commit/f011b598070dd46ae6fe69e7ff934c0bfe9e948a))
* add ERC725AccountCore ([c584e13](https://github.com/ERC725Alliance/ERC725/commit/c584e13a8946ce78214112858c1399196efb0581))
* add execute batch function to ERC725X ([a0b08fa](https://github.com/ERC725Alliance/ERC725/commit/a0b08fafccd1f009a497ca400efd50933a478457))
* Add STATICCALL to ERC725X ([#58](https://github.com/ERC725Alliance/ERC725/issues/58)) ([3fac54e](https://github.com/ERC725Alliance/ERC725/commit/3fac54eb2a4feb5ee283095b8950ab56ca97fd70))
* **ERC725X:** add delegatecall ([8e2a76f](https://github.com/ERC725Alliance/ERC725/commit/8e2a76fab239a0138859719a956fc5ec91c43ff1))
* **ERC725X:** return contract address as bytes ([26fe29c](https://github.com/ERC725Alliance/ERC725/commit/26fe29c04822a38e9f90b3b89c609805c2f6bd73))
* getData and setData overloading  ([#93](https://github.com/ERC725Alliance/ERC725/issues/93)) ([014c41e](https://github.com/ERC725Alliance/ERC725/commit/014c41e342db5b1e1c5880d5fd81a66841617529))
* optimize universalReceiver function (more flexible) ([#77](https://github.com/ERC725Alliance/ERC725/issues/77)) ([ad6be29](https://github.com/ERC725Alliance/ERC725/commit/ad6be293f6cd4eb6bbe302642c6d2f71369ab0e4))
* register ERC725Account id + test ([7e08ea9](https://github.com/ERC725Alliance/ERC725/commit/7e08ea930241cd8880100d39b143f4b54ee0a8c0))
* remove SupportedStandard:ERC725Account ([ad65cb4](https://github.com/ERC725Alliance/ERC725/commit/ad65cb4e81e68be4de341a4ba8ead57040ed33b1))


### Bug Fixes

* :children_crossing: change library function visibility to internal ([#62](https://github.com/ERC725Alliance/ERC725/issues/62)) ([5d3e70e](https://github.com/ERC725Alliance/ERC725/commit/5d3e70e8ca053c01891784215d9d03c12602bb2a))
* [QSP-4] prevent `address(0)` to be set as contract owner on deployment ([#159](https://github.com/ERC725Alliance/ERC725/issues/159)) ([29123ea](https://github.com/ERC725Alliance/ERC725/commit/29123ea3ad1bc0e173f608b42737af18a0694a89))
* add constants ([839e161](https://github.com/ERC725Alliance/ERC725/commit/839e1616e4d1e7b12baa8756a63df428e012542e))
* add utils ([bc7f765](https://github.com/ERC725Alliance/ERC725/commit/bc7f765250263d52006fcab3065ca8aecbde7c43))
* calldata to memory ([bbdddbb](https://github.com/ERC725Alliance/ERC725/commit/bbdddbb28cb2e062924a21aeaf596def2a87c034))
* change Ownable to OwnableUnset ([44f742f](https://github.com/ERC725Alliance/ERC725/commit/44f742fd6324345de4462d4f864967cb94d357dc))
* check contract balance against provided `_value` to `erc725X.execute(...)` ([#102](https://github.com/ERC725Alliance/ERC725/issues/102)) ([8a96bcc](https://github.com/ERC725Alliance/ERC725/commit/8a96bcc56e447ba8064630a59a04f33c9ec0c0dc)), closes [#78](https://github.com/ERC725Alliance/ERC725/issues/78)
* check for zero value with staticcall and delegatecall ([#108](https://github.com/ERC725Alliance/ERC725/issues/108)) ([9fb6b1d](https://github.com/ERC725Alliance/ERC725/commit/9fb6b1d3b06fdefa5f4eafaf66e7b91e4ca14af9))
* delete ERC725Y duplicated test ([1aa0f19](https://github.com/ERC725Alliance/ERC725/commit/1aa0f1929bafc24e1d7c683991e8cb792e949558))
* emit `Executed` event before the external call ([#173](https://github.com/ERC725Alliance/ERC725/issues/173)) ([13743ae](https://github.com/ERC725Alliance/ERC725/commit/13743aedc1d6dce3e50cd8dd3b82b0e51fbd6827))
* ERC725X and ERC725Y inherit Ownable first ([4a95fcd](https://github.com/ERC725Alliance/ERC725/commit/4a95fcdf2a76152936cdbd248ea789a5050ecbc0)), closes [OpenZeppelin/openzeppelin-contracts#1128](https://github.com/OpenZeppelin/openzeppelin-contracts/issues/1128)
* **erc725x:** check contract balance against provided `_value` to `erc725X.execute(...)` ([#97](https://github.com/ERC725Alliance/ERC725/issues/97)) ([22b3ea5](https://github.com/ERC725Alliance/ERC725/commit/22b3ea5c529d3874e1277d4a7c923377bf058177))
* fix appendix overwriting bug in ERC725Utils ([#76](https://github.com/ERC725Alliance/ERC725/issues/76)) ([f7d3b33](https://github.com/ERC725Alliance/ERC725/commit/f7d3b336920b18c6cce90edbcc2173cfe276b924))
* fix interface id calculation ([916d3ed](https://github.com/ERC725Alliance/ERC725/commit/916d3ed09210ba4441ab2d19e2ab81fc76c067c5))
* ignores return value by ErrorHandlerLib.revertWithParsedError(result) ([#133](https://github.com/ERC725Alliance/ERC725/issues/133)) ([6ef9cdc](https://github.com/ERC725Alliance/ERC725/commit/6ef9cdc4739c43c550defa62b025767911998733))
* inherit most base to most derived ([#107](https://github.com/ERC725Alliance/ERC725/issues/107)) ([70d3b67](https://github.com/ERC725Alliance/ERC725/commit/70d3b67af494e7a5f74ae033a7436f9766a1cb98))
* initializer re-entrancy vulnerability from OZ (4.4.1) ([#81](https://github.com/ERC725Alliance/ERC725/issues/81)) ([05ae69b](https://github.com/ERC725Alliance/ERC725/commit/05ae69b3a8a4727fa734a258f2dc55de3c0f5488)), closes [#78](https://github.com/ERC725Alliance/ERC725/issues/78)
* mark initialize(...) as internal for onlyInitializing ([#88](https://github.com/ERC725Alliance/ERC725/issues/88)) ([2fd43ef](https://github.com/ERC725Alliance/ERC725/commit/2fd43ef09547202590f79c524470a174ca7bd60e))
* optimize `OwnableUnset` custom contract ([#115](https://github.com/ERC725Alliance/ERC725/issues/115)) ([3aae83a](https://github.com/ERC725Alliance/ERC725/commit/3aae83a9303cf1d726c526182146724e6d4a3753))
* package-lock.json file ([#60](https://github.com/ERC725Alliance/ERC725/issues/60)) ([c1ae639](https://github.com/ERC725Alliance/ERC725/commit/c1ae63996a966e20a70f126ed0b0d8b87bfaf5de))
* remove duplicate COntext.sol ([f6b1413](https://github.com/ERC725Alliance/ERC725/commit/f6b141379f8269e12c0eecc8dda1af2b5940ee1e))
* remove Utils ([1f3fdb8](https://github.com/ERC725Alliance/ERC725/commit/1f3fdb83e4bd7c5e0e8a9ac4885f8e07e360b179))
* replace `super` with `ERC165` in `supportsInterface` ([#116](https://github.com/ERC725Alliance/ERC725/issues/116)) ([8aea32b](https://github.com/ERC725Alliance/ERC725/commit/8aea32b8abffaf1f9d9701ab942be3bccce85c2c))
* replace with openzeppelin contracts ([1a0d03e](https://github.com/ERC725Alliance/ERC725/commit/1a0d03eb59d70ef64db9316ef6bbc68f9f35faf6))
* run tests before publish ([f788acf](https://github.com/ERC725Alliance/ERC725/commit/f788acfa1728499058e64ecfff1e30dbfef86100))
* use IERC725Y in ERC725Utils ([cf0c9b6](https://github.com/ERC725Alliance/ERC725/commit/cf0c9b6899116d6c619feb567b10392040e9c9d3))


* remove `owner()` check for delegatecall + add WARNING comment ([#119](https://github.com/ERC725Alliance/ERC725/issues/119)) ([ac1837c](https://github.com/ERC725Alliance/ERC725/commit/ac1837c4e7a8fa9fc355ce14ee198657f1df2365))
* replace error strings by custom errors + use `enum` for `OPERATION_TYPE` ([#175](https://github.com/ERC725Alliance/ERC725/issues/175)) ([9d5008b](https://github.com/ERC725Alliance/ERC725/commit/9d5008bd4e91f6a8c09a22f0b491fe6db3249cf7))

## [3.2.0](https://github.com/ERC725Alliance/ERC725/compare/v3.1.0...v3.2.0) (2022-09-01)

### ⚠ BREAKING CHANGES

- add `bytes dataValue` parameter to `DataChanged` event in ERC725Y (#163)
- removed custom `Initializable` contract (#150)
- removed `GasLib` library in favour of `internal uncheckedIncrement(...)` function (#160)

### Features

- add `bytes dataValue` parameter to `DataChanged` event in ERC725Y ([#163](https://github.com/ERC725Alliance/ERC725/issues/163)) ([9f88ee0](https://github.com/ERC725Alliance/ERC725/commit/9f88ee0a40fe9eaa197ac946cf92e43b313e3c5f))

### Bug Fixes

- [QSP-4] prevent `address(0)` to be set as contract owner on deployment ([#159](https://github.com/ERC725Alliance/ERC725/issues/159)) ([5c47854](https://github.com/ERC725Alliance/ERC725/commit/5c4785426508b68623c3f217111822f7377076bd))

## [3.1.2](https://github.com/ERC725Alliance/ERC725/compare/v3.1.0...v3.1.2) (2022-07-08)

This patch release introduces the important bug fixes, as well as some minor optimizations.

<br>

- **bug fix 1:** :no_entry: The contracts `ERC725XInit` and `ERC725YInit` (to be used as implementation contracts behind proxies) are **now initialized immediately on deployment.**

In previous releases, the `initialize(...)` function needed to be called immediately after deployment, creating a security risk through race conditions. These base implementation contracts are now immediately lock while being deployed, through the use of the [`_disableInitializer(...)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/8b778fa20d6d76340c5fac1ed66c80273f05b95a/contracts/proxy/utils/Initializable.sol#L131) function from the OpenZeppelin contract [`Initializable.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/utils/Initializable.sol).

This function also ensures that the base contract cannot be re-initialized, for instance when `ERC725XInit`, `ERC725YInit` or `ERC725Init` are used through inheritance. If your contract derives from one of these three contracts, the `initialize(...)` function cannot be called in the parent contract via the most derived `constructor`/`initializer`function.

<br>

- **bug fix 2:** drop support for `ErrorHandlerLib` contract library.

This contract library is now removed from the package, in favour of the [`verifyCallResult(...)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/8b778fa20d6d76340c5fac1ed66c80273f05b95a/contracts/utils/Address.sol#L219) from the OpenZeppelin [`Address.sol` library](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol).

If you were using this `ErrorHandlerLib` library, we recommend migrating to the function mentioned above from OpenZeppelin.

> **NB:** the `ErrorHandlerLib.revertWithParsedError(...)` function also contained a minor bug, related to ignoring the value returned by the function.

<br>

### Bug Fixes

- ignores return value by ErrorHandlerLib.revertWithParsedError(result) ([#133](https://github.com/ERC725Alliance/ERC725/issues/133)) ([f4d6b83](https://github.com/ERC725Alliance/ERC725/commit/f4d6b83fc92502d76fa302fd123969187650f6ce))
- lock base `ERC725XInit` and `ERC725YInit` contracts on deployment ([#139](https://github.com/ERC725Alliance/ERC725/issues/139)) ([26a5da5](https://github.com/ERC725Alliance/ERC725/commit/26a5da52ae1f83d78a736c11f45a25ff9b03e672))

<br>

## [3.1.1](https://github.com/ERC725Alliance/ERC725/compare/v3.1.0...v3.1.1) (2022-06-07)

This minor release include the following two changes:

- `constants.sol` now include the `bytes4` selectors of the overloaded functions `setData(bytes32,bytes)` and `setData(bytes32[],bytes[])` from ERC725Y ([#126](https://github.com/ERC725Alliance/ERC725/issues/126)) ([a4e6b52](https://github.com/ERC725Alliance/ERC725/commit/a4e6b52f58a9abc781841017b963f31e99624e83))
- remove `Context` contract from `OwnableUnset` ( [#129](https://github.com/ERC725Alliance/ERC725/pull/129) )

## [3.1.0](https://github.com/ERC725Alliance/ERC725/compare/v3.0.3...v3.1.0) (2022-06-07)

### ⚠ BREAKING CHANGES

- remove `value` param in `DataChanged` event (#123)

### Features

- remove `value` param in `DataChanged` event ([#123](https://github.com/ERC725Alliance/ERC725/issues/123)) ([8794d16](https://github.com/ERC725Alliance/ERC725/commit/8794d16033fbfc97d3d26808fdcc6602abd4a6da))

## [3.0.3](https://www.npmjs.com/package/@erc725/smart-contracts/v/3.0.3) (2022-05-25)

- `ERC725X`: removed `owner()` check for operation delegatecall ([#119](https://github.com/ERC725Alliance/ERC725/pull/119))
- added custom `Initializable` contract for `ERC725XInitAbstract` and `ERC725YInitAbstract` ([#114](https://github.com/ERC725Alliance/ERC725/pull/114))

### Bug Fixes

- check that `_to == address(0)` (**zero-address**) in `ERC725X` when operation is CREATE or CREATE2 ([#112](https://github.com/ERC725Alliance/ERC725/pull/112))

---

## [3.0.2](https://www.npmjs.com/package/@erc725/smart-contracts/v/3.0.2) (2022-05-09)

### BREAKING CHANGE

- the `Executed` event in `ERC725X` use only the `bytes4` selector, instead of the full `bytes _data` ([#104](https://github.com/ERC725Alliance/ERC725/pull/104))

### Bug Fixes

- check that `_value == 0` in `ERC725X` when operation is STATICCALL or DELEGATECALL, as value cannot be transferred with these operation types ([#108](https://github.com/ERC725Alliance/ERC725/pull/108)) ([9fb6b1d](https://github.com/ERC725Alliance/ERC725/commit/9fb6b1d3b06fdefa5f4eafaf66e7b91e4ca14af9))
- change inheritance order from most base to most derived ([#107](https://github.com/ERC725Alliance/ERC725/pull/107)) ([70d3b67](https://github.com/ERC725Alliance/ERC725/commit/70d3b67af494e7a5f74ae033a7436f9766a1cb98))

---

## [3.0.1](https://www.npmjs.com/package/@erc725/smart-contracts/v/3.0.1) (2022-04-28)

- the `_setOwner(address)` function in `OwnableUnset` was changed from `private` to `internal` ([#103](https://github.com/ERC725Alliance/ERC725/pull/103))
- the contracts now implement the `supportsInterface(bytes4)` function via `ERC165` (previously `ERC165Storage`). This reduce gas deployment cost + save gas when calling `supportsInterface(bytes4)` function, as the interface IDs are nto read from the contract storage anymore but rather hardcoded inside the implementation function ([#96](https://github.com/ERC725Alliance/ERC725/pull/96))

### Bug Fixes

- in `ERC725X`, check the contract balance against the provided `_value` parameter, to ensure the contract has enough to transfer (this made the call revert silently before). ([PR #102](https://github.com/ERC725Alliance/ERC725/pull/102)) ([8a96bcc](https://github.com/ERC725Alliance/ERC725/commit/8a96bcc56e447ba8064630a59a04f33c9ec0c0dc))

---

## [3.0.0](https://www.npmjs.com/package/@erc725/smart-contracts/v/3.0.0) (2022-03-29)

- add [`constants.js`](https://github.com/ERC725Alliance/ERC725/blob/main/implementations/constants.**js**) file in the npm package. This file includes the `INTERFACE_ID` of ERC725X and ERC725Y + the different operation types used by ERC725X.

### BREAKING CHANGES

- getData and setData overloading ([#93](https://github.com/ERC725Alliance/ERC725/issues/93)) ([014c41e](https://github.com/ERC725Alliance/ERC725/commit/014c41e342db5b1e1c5880d5fd81a66841617529))

### Features

- `ERC725X` now handle custom revert error introduced in [solc 0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4) ([#86](https://github.com/ERC725Alliance/ERC725/pull/86))

### Bug Fixes

- mark initialize(...) as internal for onlyInitializing ([#88](https://github.com/ERC725Alliance/ERC725/issues/88)) ([2fd43ef](https://github.com/ERC725Alliance/ERC725/commit/2fd43ef09547202590f79c524470a174ca7bd60e))
- fix initializer re-entrancy issue from OZ ([#81](https://github.com/ERC725Alliance/ERC725/pull/81)), closes [#78](https://github.com/ERC725Alliance/ERC725/issues/78)

---

## [2.1.7](https://www.npmjs.com/package/@erc725/smart-contracts/v/2.1.7) (2021-12-20)

## [2.1.6](https://www.npmjs.com/package/@erc725/smart-contracts/v/2.1.6) (2021-12-13)

## [2.1.5](https://www.npmjs.com/package/@erc725/smart-contracts/v/2.1.5) (2021-12-06)

## [2.1.4](https://www.npmjs.com/package/@erc725/smart-contracts/v/2.1.4) (2021-11-17)

## [2.1.3](https://www.npmjs.com/package/@erc725/smart-contracts/v/2.1.3) (2021-11-12)
