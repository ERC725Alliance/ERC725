// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall`, as well creating contracts using `create` and `create2`.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 *
 * `execute` should only be callable by the owner of the contract set via ERC173.
 */
/* is ERC165, ERC173 */
interface IERC725X {
    /**
     * @dev Emitted when a contract is created.
     */
    event ContractCreated(
        uint256 indexed _operation,
        address indexed _contractAddress,
        uint256 indexed _value
    );

    /**
     * @dev Emitted when a contract executed.
     */
    event Executed(
        uint256 indexed _operation,
        address indexed _to,
        uint256 indexed _value,
        bytes _data
    );

    /**
     * @dev Executes any other smart contract.
     * SHOULD only be callable by the owner of the contract set via ERC173.
     *
     * Requirements:
     *
     * - `operationType`, the operation to execute. So far defined is:
     *     CALL = 0;
     *     CREATE = 1;
     *     CREATE2 = 2;
     *     STATICCALL = 3;
     *     DELEGATECALL = 4;
     *
     * - `data` the call data that will be used with the contract at `to`
     *
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2.
     */
    function execute(
        uint256 operationType,
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory);
}
