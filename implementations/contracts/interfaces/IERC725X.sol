// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title The interface for the ERC725X sub-standard, a generic executor.
 * @dev ERC725X provides the ability to call arbitrary functions on any other smart contract (including itself).
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
interface IERC725X is IERC165 {
    /**
     * @notice Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).
     * @dev Emitted when a new contract was created and deployed.
     * @param operationType The opcode used to deploy the contract (`CREATE` or `CREATE2`).
     * @param contractAddress The created contract address.
     * @param value The amount of native tokens (in Wei) sent to fund the created contract on deployment.
     * @param salt The salt used to deterministically deploy the contract (`CREATE2` only). If `CREATE` opcode is used, the salt value will be `bytes32(0)`.
     */
    event ContractCreated(
        uint256 indexed operationType,
        address indexed contractAddress,
        uint256 indexed value,
        bytes32 salt
    );

    /**
     * @notice Called address `target` using `operationType` with `value` wei and `data`.
     * @dev Emitted when calling an address `target` (EOA or contract) with `value`.
     * @param operationType The low-level call opcode used to call the `target` address (`CALL`, `STATICALL` or `DELEGATECALL`).
     * @param target The address to call. `target` will be unused if a contract is created (operation types 1 and 2).
     * @param value The amount of native tokens transferred along the call (in Wei).
     * @param selector The first 4 bytes (= function selector) of the data sent with the call.
     */
    event Executed(
        uint256 indexed operationType,
        address indexed target,
        uint256 indexed value,
        bytes4 selector
    );

    /**
     * @notice Calling address `target` using `operationType`, transferring `value` wei and data: `data`.
     * 
     * @param operationType The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4
     * @param target The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)
     * @param value The amount of native tokens to transfer (in Wei)
     * @param data The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.
     *
     * @dev Generic executor function to:
     *
     * - send native tokens to any address.
     * - interact with any contract by passing an abi-encoded function call in the `data` parameter.
     * - deploy a contract by providing its creation bytecode in the `data` parameter.
     *
     * @custom:requiremements
     * - SHOULD only be callable by the {owner} of the contract.
     * - if a `value` is provided, the contract MUST have at least this amount to transfer to `target` from its balance and execute successfully.
     * - if the operation type is `STATICCALL` (`3`) or `DELEGATECALL` (`4`), `value` transfer is disallowed and SHOULD be 0.
     * - `target` SHOULD be `address(0)` when deploying a new contract via `operationType` `CREATE` (`1`), or `CREATE2` (`2`).
     *
     * @custom:events
     * - {Executed} event when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL).
     * - {ContractCreated} event when deploying a new contract with `operationType` 1 (CREATE) or 2 (CREATE2).
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) external payable returns (bytes memory);

    /**
     * @notice Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.
     * 
     * @dev Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.
     * 
     * @param operationsType The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`
     * @param targets The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).
     * @param values The list of native token amounts to transfer (in Wei).
     * @param datas The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.
     *
     * @custom:requirements
     * - All the array parameters provided MUST be equal and have the same length.
     * - SHOULD only be callable by the {owner} of the contract.
     * - The contract MUST have in its balance **at least the sum of all the `values`** to transfer and execute successfully each calldata payloads.
     *
     * @custom:events
     * - {Executed} event, when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL)
     * - {ContractCreated} event, when deploying a contract with `operationType` 1 (CREATE) or 2 (CREATE2)
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) external payable returns (bytes[] memory);
}
