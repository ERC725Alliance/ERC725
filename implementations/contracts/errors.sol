// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev reverts when trying to send more native tokens `value` than available in current `balance`.
 * @param balance the balance of the ERC725X contract.
 * @param value the amount of native tokens sent via `ERC725X.execute(...)`.
 */
error ERC725X_InsufficientBalance(uint256 balance, uint256 value);

/**
 * @dev reverts when the `operationTypeProvided` is none of the default operation types available.
 * (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)
 */
error ERC725X_UnknownOperationType(uint256 operationTypeProvided);

/**
 * @dev the `value` parameter (= sending native tokens) is not allowed when making a staticcall
 * via `ERC725X.execute(...)` because sending native tokens is a state changing operation.
 */
error ERC725X_MsgValueDisallowedInStaticCall();

/**
 * @dev the `value` parameter (= sending native tokens) is not allowed when making a delegatecall
 * via `ERC725X.execute(...)` because msg.value is persisting.
 */
error ERC725X_MsgValueDisallowedInDelegateCall();

/**
 * @dev reverts when passing a `to` address while deploying a contract va `ERC725X.execute(...)`
 * whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_CreateOperationsRequireEmptyRecipientAddress();

/**
 * @dev reverts when contract deployment via `ERC725X.execute(...)` failed.
 * whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_ContractDeploymentFailed();

/**
 * @dev reverts when no contract bytecode was provided as parameter when trying to deploy a contract
 * via `ERC725X.execute(...)`, whether using operation type 1 (CREATE) or 2 (CREATE2).
 */
error ERC725X_NoContractBytecodeProvided();

/**
 * @dev reverts when there is not the same number of operation, to addresses, value, and data.
 */
error ERC725X_ExecuteParametersLengthMismatch();

/**
 * @dev reverts when there is not the same number of elements in the lists of data keys and data values
 * when calling setData(bytes32[],bytes[]).
 * @param dataKeysLength the number of data keys in the bytes32[] dataKeys
 * @param dataValuesLength the number of data value in the bytes[] dataValue
 */
error ERC725Y_DataKeysValuesLengthMismatch(uint256 dataKeysLength, uint256 dataValuesLength);
