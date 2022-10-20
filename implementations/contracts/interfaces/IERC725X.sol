// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title The interface for ERC725X General executor
 * @dev ERC725X provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall`, as well as creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
interface IERC725X is IERC165 {
    /**
     * @notice Emitted when a contract is created
     * @param operation The operation used to create a contract
     * @param contractAddress The created contract address
     * @param value The amount of native tokens (in Wei) sent to the created contract address
     */
    event ContractCreated(
        uint256 indexed operation,
        address indexed contractAddress,
        uint256 indexed value
    );

    /**
     * @notice Emitted when a contract executed.
     * @param operation The operation used to execute a contract
     * @param to The address where the call is executed
     * @param value The amount of native tokens transferred with the call (in Wei).
     * @param selector The first 4 bytes (= function selector) of the data sent with the call
     */
    event Executed(
        uint256 indexed operation,
        address indexed to,
        uint256 indexed value,
        bytes4 selector
    );

    /**
     * @param operationType The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3 DELEGATECALL = 4
     * @param to The smart contract or address to interact with (unused if a contract is created via operation 1 or 2)
     * @param value The amount of native tokens to transfer (in Wei).
     * @param data The call data, or the bytecode of the contract to deploy
     * 
     * @dev Generic executor function to:
     * 
     * - send native tokens to any address.
     * - interact with any contract by passing an abi-encoded function call in the `data` parameter.
     * - deploy a contract by providing its bytecode via the `data` parameter
     * 
     * Requirements:
     * 
     * - SHOULD only be callable by the owner of the contract set via ERC173.
     * - if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
     *  `to` SHOULD be address(0) when deploying a contract.
     *
     * Emits an {Executed} event, when a call is executed under `operationType` 0, 3 and 4
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2
     */
    function execute(
        uint256 operationType,
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory);
}
