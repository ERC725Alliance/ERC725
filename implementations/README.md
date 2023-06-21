# @erc725/smart-contracts &middot; [![npm version](https://img.shields.io/npm/v/@erc725/smart-contracts.svg?style=flat)](https://www.npmjs.com/package/@erc725/smart-contracts) [![Coverage Status](https://coveralls.io/repos/github/ERC725Alliance/ERC725/badge.svg?branch=develop)](https://coveralls.io/github/ERC725Alliance/ERC725?branch=develop)

**This package is currently in BETA, use with caution!**

This package contains an implementation of ERC725 to make it as easy as possible to get started.\
If you see ways to improve this implementation, you are welcome to create an issue or a pull request.

The package has the following contracts:

- `ERC725X.sol`: The execute part of ERC725, allows to execute any other smart contract. Uses [ERC173](https://eips.ethereum.org/EIPS/eip-173) as a basis.
- `ERC725Y.sol`: The data part of ERC725, allows to attach any key-value data to a smart contract. Uses [ERC173](https://eips.ethereum.org/EIPS/eip-173) as a basis.
- `ERC725.sol`: Combines both implementations: `ERC725X.sol` and `ERC725Y.sol`.

## Usage

To use in your project install via npm

```
npm install @erc725/smart-contracts
```

And import in your contracts in solidity

```solidity
import "@erc725/smart-contracts/contracts/ERC725.sol";

contract MyContract is ERC725 {
    ...
}
```

And import in your contract ABI in JavaScript

```js
import ERC725 from "@erc725/smart-contracts/artifacts/ERC725.json";

const myContract = new web3.eth.Contract(ERC725.abi, "0xsomeaddress...");
```

## Development

Setup:

```
npm install
```

Run tests:

```
npm test
```

Run linter:

```
npm run lint
```

## Technical References

### Interface IDs

The table below contains a list of [ERC165](https://eips.ethereum.org/EIPS/eip-165) interface IDs used by the [Solidity implementations of the ERC725 smart contracts](./contracts/).

| Interface Name                                                         | Interface ID | Description                                |
| :--------------------------------------------------------------------- | :----------- | :----------------------------------------- |
| ERC725X                                                                | `0x7545acac` | General executor                           |
| ERC725Y                                                                | `0x629aa694` | General key-value store                    |
| [ERC165](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md) | `0x01ffc9a7` | Standard Interface Detection for Contracts |

### Solc Contract details

> **Notice:** you need the `solc` compiler installed locally to use this command. [Installation instructions can be found in the solidity documentation](https://docs.soliditylang.org/en/v0.8.9/installing-solidity.html)

The repository offers a shell utility tool that generate details about each contracts (function selectors, storage layout, evm opcodes...). You can obtain them via the following command.

```bash
npm run solc
```

This will generate files and folders under `/solc`

```
solc
 |- bytecode/
 |- evm/
 |- metadata/
 |- opcodes/
 |- selectors/
 |- storage-layout/
 |- gas-costs.md

```
