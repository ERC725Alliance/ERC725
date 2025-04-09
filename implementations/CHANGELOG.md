# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [8.0.1](https://github.com/ERC725Alliance/ERC725/compare/v3.2.0...v8.0.1) (2025-04-09)


### ⚠ BREAKING CHANGES

* use `ERC165Upgradeable` for the Init version
* remove and deprecate `OwnableUnset` in favour of OZ
* inheritance of `ERC725` of standard and init version
* remove `ERC725YCore` and duplicate logic across Standard and Init version
* remove `ERC725XCore` and share logic across Standard and Init version.
* remove deprecated constants for overloaded function selectors (#219)
* remove function overloading (#209)
* mark `setData(..)` as payable (#197)
* add `salt` parameter to the `ContractCreated` event in ERC725X (#183)
* replace error strings by custom errors + use `enum` for `OPERATION_TYPE` (#175)
* add `bytes dataValue` parameter to `DataChanged` event in ERC725Y (#163)

### Features

* add `bytes dataValue` parameter to `DataChanged` event in ERC725Y ([#163](https://github.com/ERC725Alliance/ERC725/issues/163)) ([93447de](https://github.com/ERC725Alliance/ERC725/commit/93447def047abab2ad81b365b9e8c1441507f9ae))
* add execute batch function to ERC725X ([a0b08fa](https://github.com/ERC725Alliance/ERC725/commit/a0b08fafccd1f009a497ca400efd50933a478457))
* add internal `_setDataBatch` function without owner modifier ([ee0948a](https://github.com/ERC725Alliance/ERC725/commit/ee0948af85ce4d233e8f1effaafa7331a63bc257))
* allow to fund ERC725 contracts on deployment via `constructor` or `initialize(...)` function ([#213](https://github.com/ERC725Alliance/ERC725/issues/213)) ([39339e0](https://github.com/ERC725Alliance/ERC725/commit/39339e0b219af4025dc99e60faabbafae3d09df5))


### Bug Fixes

* [QSP-4] prevent `address(0)` to be set as contract owner on deployment ([#159](https://github.com/ERC725Alliance/ERC725/issues/159)) ([29123ea](https://github.com/ERC725Alliance/ERC725/commit/29123ea3ad1bc0e173f608b42737af18a0694a89))
* add check for empty array parameters in batch `ERC725X.execute(uint256[],address[],uint256[],bytes[])` / `ERC725Y.setData(bytes32[],bytes[])` ([#204](https://github.com/ERC725Alliance/ERC725/issues/204)) ([eb4bc11](https://github.com/ERC725Alliance/ERC725/commit/eb4bc11f19879db528c54b781d394b961ced3bab))
* add warning comments about `constructor` / `initialize(...)` function being `payable` despite not other way to receive native tokens ([0062905](https://github.com/ERC725Alliance/ERC725/commit/00629058e85ead3ad8e4f4af45d9c8a1176e66ac))
* emit `Executed` event before the external call ([#173](https://github.com/ERC725Alliance/ERC725/issues/173)) ([13743ae](https://github.com/ERC725Alliance/ERC725/commit/13743aedc1d6dce3e50cd8dd3b82b0e51fbd6827))
* ignores return value by ErrorHandlerLib.revertWithParsedError(result) ([#133](https://github.com/ERC725Alliance/ERC725/issues/133)) ([6ef9cdc](https://github.com/ERC725Alliance/ERC725/commit/6ef9cdc4739c43c550defa62b025767911998733))
* link to implementations folder; ([8c77fef](https://github.com/ERC725Alliance/ERC725/commit/8c77fef3ddfe4295b2d86a2b56e92850972ca0e7))


* add `salt` parameter to the `ContractCreated` event in ERC725X ([#183](https://github.com/ERC725Alliance/ERC725/issues/183)) ([4a6ca14](https://github.com/ERC725Alliance/ERC725/commit/4a6ca140b35f1d78f6fefedb11ddc3981f71acb6))
* inheritance of `ERC725` of standard and init version ([c1c5e2f](https://github.com/ERC725Alliance/ERC725/commit/c1c5e2f614620593df05d5d7efc99b5854038f4f))
* mark `setData(..)` as payable ([#197](https://github.com/ERC725Alliance/ERC725/issues/197)) ([1beae99](https://github.com/ERC725Alliance/ERC725/commit/1beae99f222574b7a67444e9dc4accde651ed957))
* remove `ERC725XCore` and share logic across Standard and Init version. ([01e5c00](https://github.com/ERC725Alliance/ERC725/commit/01e5c008a71b85e5f3e45a597f0212b97c070aba))
* remove `ERC725YCore` and duplicate logic across Standard and Init version ([c60aedb](https://github.com/ERC725Alliance/ERC725/commit/c60aedb6a859c12ae4aaebdc51c5815af908599e))
* remove and deprecate `OwnableUnset` in favour of OZ ([fc8377b](https://github.com/ERC725Alliance/ERC725/commit/fc8377baada07e2956a30c9257b1ef94ada7f800))
* remove deprecated constants for overloaded function selectors ([#219](https://github.com/ERC725Alliance/ERC725/issues/219)) ([fd43f3b](https://github.com/ERC725Alliance/ERC725/commit/fd43f3b5a268d63ef5baaf1c56e9d32be720a4f0))
* remove function overloading ([#209](https://github.com/ERC725Alliance/ERC725/issues/209)) ([5e33d36](https://github.com/ERC725Alliance/ERC725/commit/5e33d36cd4c92026730ea5cf1dd476b4017fbf2f))
* replace error strings by custom errors + use `enum` for `OPERATION_TYPE` ([#175](https://github.com/ERC725Alliance/ERC725/issues/175)) ([9d5008b](https://github.com/ERC725Alliance/ERC725/commit/9d5008bd4e91f6a8c09a22f0b491fe6db3249cf7))
* use `ERC165Upgradeable` for the Init version ([f77f9a2](https://github.com/ERC725Alliance/ERC725/commit/f77f9a2c3beec7aa15d27dff69252e0a5901918b))

## [7.0.0](https://github.com/ERC725Alliance/ERC725/compare/v6.0.0...v7.0.0) (2023-11-27)

### ⚠ BREAKING CHANGES

### Refactor

- Update `Executed` event in ERC725X to index `selector` instead of `value` ([#246](https://github.com/ERC725Alliance/ERC725/pull/246))
- Update `ContractCreated` event in ERC725X to index `salt` instead of `value` ([#246](https://github.com/ERC725Alliance/ERC725/pull/246))

## [6.0.0](https://github.com/ERC725Alliance/ERC725/compare/v5.2.0...v6.0.0) (2023-10-10)

### ⚠ BREAKING CHANGES

- Replace revert reason strings by custom `error` in `OwnableUnset` and inside `constructor` / `initialize(...)` functions for `address(0)` checks ([#236](https://github.com/ERC725Alliance/ERC725/pull/236))

### Perf

- Implement Gas Optimisations & QA from Code4Rena audit contest ([#235](https://github.com/ERC725Alliance/ERC725/pull/235))

### Bug Fixes

- fix minimum pragma `solc` version required to `0.8.4` for ERC725Y and `0.8.5` for ERC725X and ERC725 ([1afd0dd](https://github.com/ERC725Alliance/ERC725/pull/236/commits/1afd0dd1af4d7008907c0fd74cf0ad3fdf3ddbe5) and [dbc0f61](https://github.com/ERC725Alliance/ERC725/pull/236/commits/dbc0f61027b81a2a583cf25f1e2af4da4897b955))

### [5.2.0](https://github.com/ERC725Alliance/ERC725/compare/v5.1.0...v5.2.0) (2023-07-25)

- Improve Natspec comments of smart contracts ([#229](https://github.com/ERC725Alliance/ERC725/pull/229))
- Bump version of `@openzeppelin/contracts` dependency from `4.9.2` to `4.9.3`

## [5.1.0](https://github.com/ERC725Alliance/ERC725/compare/v5.0.0...v5.1.0) (2023-06-21)

### Features

- Allow to fund ERC725 contracts on deployment ([#213](https://github.com/ERC725Alliance/ERC725/pull/213))

### Refactor

- Remove deprecated constants for overloaded function selectors ([#219](https://github.com/ERC725Alliance/ERC725/pull/219))

### Build

- Upgrade to 0.8.17 for default solc compiler version ([#221](https://github.com/ERC725Alliance/ERC725/pull/221))

- Upgrade `@openzeppelin/contracts` to 4.9.2 ([#224](https://github.com/ERC725Alliance/ERC725/pull/224))

## [5.0.0](https://github.com/ERC725Alliance/ERC725/compare/v4.2.0...v5.0.0) (2023-04-26)

### ⚠ BREAKING CHANGES

- Remove function overloading and rename overloaded functions to add "Batch" keyword: ([#209](https://github.com/ERC725Alliance/ERC725/pull/209))

  - `setData(bytes32[],bytes[])` --> `setDataBatch(bytes32[],bytes[])`
  - `getData(bytes32[])` --> `getDataBatch(bytes32[])`
  - `execute(uint256[],address[],uint256[],bytes[])` --> `executeBatch(uint256[],address[],uint256[],bytes[])`

- Change interfaceId of ERC725X and ERC725Y: ([#209](https://github.com/ERC725Alliance/ERC725/pull/209))
  - ERC725X from `0x570ef073` to `0x7545acac`
  - ERC725Y from `0x714df77c` to `0x629aa694`

### Refactor

- Remove parameters from error in ERC725Y (`ERC725Y_DataKeysValuesLengthMismatch`) ([#208](https://github.com/ERC725Alliance/ERC725/pull/208))

## [4.2.0](https://github.com/ERC725Alliance/ERC725/compare/v4.1.1...v4.2.0) (2023-03-13)

### ⚠ BREAKING CHANGES

- mark `setData(..)` functions as payable ([#197](https://github.com/ERC725Alliance/ERC725/pull/197))

### [4.1.1](https://github.com/ERC725Alliance/ERC725/compare/v4.1.0...v4.1.1) (2023-01-17)

### Bug Fixes

- re-add `override` keyword for functions inherited from interface to compiling with solc compiler 0.8.7 or 0.8.6 ([#188](https://github.com/ERC725Alliance/ERC725/pull/188))

### Build

- add Errors & Events definitions to `constants.js` ([#192](https://github.com/ERC725Alliance/ERC725/pull/192))

## [4.1.0](https://github.com/ERC725Alliance/ERC725/compare/v4.0.0...v4.1.0) (2022-12-09)

### ⚠ BREAKING CHANGES

- add `salt` parameter to the `ContractCreated` event in ERC725X (#183)

### Features

- create internal virtual `_execute` function with core ERC725X logic to improve overriding core behaviour ([#184](https://github.com/ERC725Alliance/ERC725/pull/184))
- add `salt` parameter to the `ContractCreated` event in ERC725X ([#183](https://github.com/ERC725Alliance/ERC725/issues/183)) ([4a6ca14](https://github.com/ERC725Alliance/ERC725/commit/4a6ca140b35f1d78f6fefedb11ddc3981f71acb6))

## 4.0.0 (2022-10-31)

### ⚠ BREAKING CHANGES

- add underscore to variable name `store` -> `_store` (#174)
- replace error strings by custom errors (#175)
- add execute batch function to ERC725X (#177)

### Features

- add execute batch function to ERC725X ([a0b08fa](https://github.com/ERC725Alliance/ERC725/commit/a0b08fafccd1f009a497ca400efd50933a478457))

### Bug Fixes

- emit `Executed` event before the external call ([#173](https://github.com/ERC725Alliance/ERC725/issues/173)) ([13743ae](https://github.com/ERC725Alliance/ERC725/commit/13743aedc1d6dce3e50cd8dd3b82b0e51fbd6827))

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
