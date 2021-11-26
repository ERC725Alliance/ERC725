# @erc725/smart-contracts &middot; [![npm version](https://img.shields.io/npm/v/@erc725/smart-contracts.svg?style=flat)](https://www.npmjs.com/package/@erc725/smart-contracts)


**This package is currently in BETA, use with caution!**

This package contains an implementation of ERC725 to make it as easy as possible to get started.\
If you see ways to improve this implementation, you are welcome to create an issue or a pull request.

The package has the following contracts:

- `ERC725X.sol`: The execute part of ERC725, allows to execute any other smart contract. Uses [ERC173](https://eips.ethereum.org/EIPS/eip-173) as a basis.
- `ERC725Y.sol`: The data part of ERC725, allows to attach any key-value data to a smart contract. Uses [ERC173](https://eips.ethereum.org/EIPS/eip-173) as a basis.
- `ERC725.sol`: Combines both implementations: `ERC725X.sol` and `ERC725Y.sol`.
- `ERC725Account.sol`: An implementation that could be used for a smart contract based account.
  - Implements [ERC1271](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1271.md).
  - Allows to receive native tokens (like ETH) and fires the `event ValueReceived(address indexed sender, uint256 indexed value)`.
  - Sets the key hash `keccak256('ERC725Type'): 0xee97c7dd2e734cf234c2ba0d83a74633e1ac7fc8a9fd779f8497a0109c71b993` to `keccak256('ERC725Account'): 0xafdeb5d6e788fe0ba73c9eb2e30b8a4485e3a18fb31dd13e3b362f62a65c67a0` in the constructor.

## Usage

To use in your project install via npm

```
npm install @erc725/smart-contracts
```

And import in your contracts in solidity

```solidity
import "@erc725/smart-contracts/contracts/ERC725Account.sol";

contract MyContract is ERC725Account {
    ...
}
```

And import in your contract ABI in JavaScript

```js
import ERC725Account from "@erc725/smart-contracts/artifacts/ERC725Account.json";

const myContract = new web3.eth.Contract(ERC725Account.abi, "0xsomeaddress...");
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

The table below contains a list of [ERC165]() interface IDs used by the [Solidity implementations of the ERC725 smart contracts]().

| Interface Name                                                                                                            | Interface ID | Description                                             |
| :------------------------------------------------------------------------------------------------------------------------ | :----------- | :------------------------------------------------------ |
| ERC725X                                                                                                                   | `0x44c028fe` | General executor                                        |
| ERC725Y                                                                                                                   | `0x5a988c0f` | General key-value store                                 |
| ERC725Account                                                                                                             | `0x63cb749b` | `ERC725X` + `ERC725Y` + `LSP1` + `ERC1271`              |
| [ERC165](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md)                                                    | `0x01ffc9a7` | Standard Interface Detection for Contracts              |
| [ERC1271](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1271.md)                                                  | `0x1626ba7e` | Standard Signature Validation Method for Contracts      |
| [LSP1](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md)                                   | `0x6bb56a14` | Universal Receiver entry function                       |
| [LSP1Delegate](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md#lsp1universalreceiverdelegate) | `0xc2d7bcc1` | Universal Receiver delegated to an other smart contract |

The `ERC725Account`'s **interface ID** is calculated as the `XOR` of the functions selectors from the interfaces it implements.
Despite the fact that an `ERC725Account` is an **ownable contract**, the selectors from [`ERC173`](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-173.md) (`owner()` and `transferOwnership(address)`) are omitted in the calculation.

```
  getData              // ERC725Y
^ setData              // ERC725Y
^ execute              // ERC725X
^ universalReceiver    // LSP1
^ isValidSignature     // ERC1271
= 0x63cb749b           // ERC725Account
```

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
