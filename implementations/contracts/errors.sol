// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev reverts when trying to send more native tokens `value` than available in current `balance`.
 * @param balance the balance of the ERC725X contract.
 * @param value the amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.
 */
error ERC725X_InsufficientBalance(uint256 balance, uint256 value);

/**
 * @dev reverts when the `operationTypeProvided` is none of the default operation types available.
 * (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)
 */
error ERC725X_UnknownOperationType(uint256 operationTypeProvided);

/**
 * @dev the `value` parameter (= sending native tokens) is not allowed when making a staticcall
 * via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` because sending native tokens is a state changing operation.
 */
error ERC725X_MsgValueDisallowedInStaticCall();

/**
 * @dev the `value` parameter (= sending native tokens) is not allowed when making a delegatecall
 * via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` because msg.value is persisting.
 */
error ERC725X_MsgValueDisallowedInDelegateCall();

/**
 * @dev reverts when passing a `to` address while deploying a contract va `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`
 * whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_CreateOperationsRequireEmptyRecipientAddress();

/**
 * @dev reverts when contract deployment via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` failed.
 * whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_ContractDeploymentFailed();

/**
 * @dev reverts when no contract bytecode was provided as parameter when trying to deploy a contract
 * via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`, whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_NoContractBytecodeProvided();

/**
 * @dev reverts when there is not the same number of operation, to addresses, value, and data.
 */
error ERC725X_ExecuteParametersLengthMismatch();

/**
 * @dev reverts when one of the array parameter provided to
 * `executeBatch(uint256[],address[],uint256[],bytes[]) is an empty array
 */
error ERC725X_ExecuteParametersEmptyArray();

/**
 * @dev reverts when there is not the same number of elements in the lists of data keys and data values
 * when calling setDataBatch.
 */
error ERC725Y_DataKeysValuesLengthMismatch();

/**
 * @dev reverts when one of the array parameter provided to
 * `setDataBatch` is an empty array
 */
error ERC725Y_DataKeysValuesEmptyArray();

/**
 * @dev reverts when sending value to the `setData(..)` functions
 */
error ERC725Y_MsgValueDisallowed();
