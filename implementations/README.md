# ERC725 Implementation

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
npm install
```

And import in your contracts

```
import "erc725/contracts/ERC725/ERC725Account.sol";

contract MyContract is ERC725Account {
    ...
}
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

Run linter (solium):

```
npm run lint
```

### Solc Contract details

The repository offers a shell utility tool that uses `solc` to generate details about each contracts (function selectors, storage layout, evm opcodes...)
These details can be shown using the following command.

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

NB: The `solc` compiler needs to be installed in order to use this utility tool. [Installation instructions can be found in the solidity documentation](https://docs.soliditylang.org/en/v0.8.9/installing-solidity.html)
