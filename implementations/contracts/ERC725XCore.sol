// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC725X} from "./interfaces/IERC725X.sol";

// libraries
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";

// constants
import {
    _INTERFACEID_ERC725X,
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "./constants.sol";

import "./errors.sol";

/**
 * @title Core implementation of ERC725X executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XCore is OwnableUnset, ERC165, IERC725X {
    /**
     * @inheritdoc IERC725X
     */
    function execute(
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) public payable virtual onlyOwner returns (bytes memory) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }
        return _execute(operationType, to, value, data);
    }

    /**
     * @inheritdoc IERC725X
     */
    function execute(
        uint256[] memory operationsType,
        address[] memory to,
        uint256[] memory values,
        bytes[] memory data
    ) public payable virtual onlyOwner returns (bytes[] memory result) {
        if (
            operationsType.length != to.length ||
            (to.length != values.length || values.length != data.length)
        ) revert ERC725X_ExecuteParametersLengthMismatch();

        result = new bytes[](operationsType.length);
        for (uint256 i = 0; i < operationsType.length; i++) {
            if (address(this).balance < values[i])
                revert ERC725X_InsufficientBalance(address(this).balance, values[i]);

            result[i] = _execute(operationsType[i], to[i], values[i], data[i]);
        }
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC165)
        returns (bool)
    {
        return interfaceId == _INTERFACEID_ERC725X || super.supportsInterface(interfaceId);
    }

    /**
     * @dev check the `operationType` provided and perform the associated low-level opcode.
     * see `IERC725X.execute(...)`.
     */
    function _execute(
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory) {
        // CALL
        if (operationType == OPERATION_0_CALL) {
            return _executeCall(to, value, data);
        }

        // Deploy with CREATE
        if (operationType == uint256(OPERATION_1_CREATE)) {
            if (to != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate(value, data);
        }

        // Deploy with CREATE2
        if (operationType == uint256(OPERATION_2_CREATE2)) {
            if (to != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate2(value, data);
        }

        // STATICCALL
        if (operationType == uint256(OPERATION_3_STATICCALL)) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInStaticCall();
            return _executeStaticCall(to, data);
        }

        // DELEGATECALL
        //
        // WARNING! delegatecall is a dangerous operation type! use with EXTRA CAUTION
        //
        // delegate allows to call another deployed contract and use its functions
        // to update the state of the current calling contract.
        //
        // this can lead to unexpected behaviour on the contract storage, such as:
        // - updating any state variables (even if these are protected)
        // - update the contract owner
        // - run selfdestruct in the context of this contract
        //
        if (operationType == uint256(OPERATION_4_DELEGATECALL)) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInDelegateCall();
            return _executeDelegateCall(to, data);
        }

        revert ERC725X_UnknownOperationType(operationType);
    }

    /**
     * @dev perform low-level call (operation type = 0)
     * @param to The address on which call is executed
     * @param value The value to be sent with the call
     * @param data The data to be sent with the call
     * @return result The data from the call
     */
    function _executeCall(
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        emit Executed(OPERATION_0_CALL, to, value, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.call{value: value}(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level staticcall (operation type = 3)
     * @param to The address on which staticcall is executed
     * @param data The data to be sent with the staticcall
     * @return result The data returned from the staticcall
     */
    function _executeStaticCall(address to, bytes memory data)
        internal
        virtual
        returns (bytes memory result)
    {
        emit Executed(OPERATION_3_STATICCALL, to, 0, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.staticcall(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level delegatecall (operation type = 4)
     * @param to The address on which delegatecall is executed
     * @param data The data to be sent with the delegatecall
     * @return result The data returned from the delegatecall
     */
    function _executeDelegateCall(address to, bytes memory data)
        internal
        virtual
        returns (bytes memory result)
    {
        emit Executed(OPERATION_4_DELEGATECALL, to, 0, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.delegatecall(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev deploy a contract using the CREATE opcode (operation type = 1)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s)
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate(uint256 value, bytes memory creationCode)
        internal
        virtual
        returns (bytes memory newContract)
    {
        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        address contractAddress;
        // solhint-disable no-inline-assembly
        assembly {
            contractAddress := create(value, add(creationCode, 0x20), mload(creationCode))
        }

        if (contractAddress == address(0)) {
            revert ERC725X_ContractDeploymentFailed();
        }

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(OPERATION_1_CREATE, contractAddress, value);
    }

    /**
     * @dev deploy a contract using the CREATE2 opcode (operation type = 2)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s) and a bytes32 salt
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate2(uint256 value, bytes memory creationCode)
        internal
        virtual
        returns (bytes memory newContract)
    {
        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        bytes32 salt = BytesLib.toBytes32(creationCode, creationCode.length - 32);
        bytes memory bytecode = BytesLib.slice(creationCode, 0, creationCode.length - 32);
        address contractAddress = Create2.deploy(value, salt, bytecode);

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(OPERATION_2_CREATE2, contractAddress, value);
    }
}
