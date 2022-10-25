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
     * @notice Emitted when deploying a contract
     * @param operationType The opcode used to deploy the contract (CREATE or CREATE2)
     * @param contractAddress The created contract address
     * @param value The amount of native tokens (in Wei) sent to fund the created contract address
     */
    event ContractCreated(
        uint256 indexed operationType,
        address indexed contractAddress,
        uint256 indexed value
    );

    /**
     * @notice Emitted when calling an address (EOA or contract)
     * @param operationType The low-level call opcode used to call the `to` address (CALL, STATICALL or DELEGATECALL)
     * @param to The address to call whether an EOA or a contract
     * @param value The amount of native tokens transferred with the call (in Wei)
     * @param selector The first 4 bytes (= function selector) of the data sent with the call
     */
    event Executed(
        uint256 indexed operationType,
        address indexed to,
        uint256 indexed value,
        bytes4 selector
    );

    /**
     * @param operationType The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4
     * @param to The address of the EOA or smart contract to (unused if a contract is created via operation type 1 or 2)
     * @param value The amount of native tokens to transfer (in Wei)
     * @param data The call data, or the creation bytecode of the contract to deploy
     *
     * @dev Generic executor function to:
     *
     * - send native tokens to any address.
     * - interact with any contract by passing an abi-encoded function call in the `data` parameter.
     * - deploy a contract by providing its creation bytecode in the `data` parameter.
     *
     * Requirements:
     *
     * - SHOULD only be callable by the owner of the contract set via ERC173.
     * - if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
     * - `to` SHOULD be address(0) when deploying a contract.
     *
     * Emits an {Executed} event, when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL)
     * Emits a {ContractCreated} event, when deploying a contract with `operationType` 1 (CREATE) or 2 (CREATE2)
     */
    function execute(
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) external payable returns (bytes memory);

    /**
     * @param operationsType The list of operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4
     * @param to The list of {to} addresses to interact with
     * @param values The list of amount of native tokens to transfer (in Wei)
     * @param data The list of call data, or the creation bytecode of the contract to deploy
     *
     * @dev Generic executor function to:
     *
     * - send native tokens to any address.
     * - interact with any contract by passing an abi-encoded function call in the `data` parameter.
     * - deploy a contract by providing its creation bytecode in the `data` parameter.
     *
     * Requirements:
     *
     * - The length of the parameters provided MUST be equal
     * - SHOULD only be callable by the owner of the contract set via ERC173.
     * - if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
     * - `to` SHOULD be address(0) when deploying a contract.
     *
     * Emits an {Executed} event, when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL)
     * Emits a {ContractCreated} event, when deploying a contract with `operationType` 1 (CREATE) or 2 (CREATE2)
     */
    function execute(
        uint256[] memory operationsType,
        address[] memory to,
        uint256[] memory values,
        bytes[] memory data
    ) external payable returns (bytes[] memory);
}
