// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// interfaces
import {
    IERC165Upgradeable
} from "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import {IERC725XUpgradeable} from "./interfaces/IERC725XUpgradeable.sol";

// libraries
import {Create2Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/Create2Upgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// modules
import {
    ERC165Upgradeable
} from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// constants
import {
    _INTERFACEID_ERC725X,
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "./constantsUpgradeable.sol";

import "./errorsUpgradeable.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 X Executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XUpgradeable is
    Initializable,
    ERC165Upgradeable,
    OwnableUpgradeable,
    IERC725XUpgradeable
{
    function __ERC725X_init(address newOwner) internal onlyInitializing {
        OwnableUpgradeable.__Ownable_init();
        __ERC725X_init_unchained(newOwner);
    }

    function __ERC725X_init_unchained(address newOwner) internal onlyInitializing {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        OwnableUpgradeable._transferOwnership(newOwner);
    }

    /**
     * @inheritdoc IERC725XUpgradeable
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        return _execute(operationType, target, value, data);
    }

    /**
     * @inheritdoc IERC725XUpgradeable
     */
    function execute(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override onlyOwner returns (bytes[] memory) {
        return _execute(operationsType, targets, values, datas);
    }

    /**
     * @inheritdoc ERC165Upgradeable
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_ERC725X || super.supportsInterface(interfaceId);
    }

    /**
     * @dev check the `operationType` provided and perform the associated low-level opcode.
     * see `IERC725X.execute(uint256,address,uint256,bytes)`.
     */
    function _execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory) {
        // CALL
        if (operationType == OPERATION_0_CALL) {
            return _executeCall(target, value, data);
        }

        // Deploy with CREATE
        if (operationType == uint256(OPERATION_1_CREATE)) {
            if (target != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate(value, data);
        }

        // Deploy with CREATE2
        if (operationType == uint256(OPERATION_2_CREATE2)) {
            if (target != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate2(value, data);
        }

        // STATICCALL
        if (operationType == uint256(OPERATION_3_STATICCALL)) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInStaticCall();
            return _executeStaticCall(target, data);
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
            return _executeDelegateCall(target, data);
        }

        revert ERC725X_UnknownOperationType(operationType);
    }

    /**
     * @dev same as `_execute` but for batch execution
     * see `IERC725X,execute(uint256[],address[],uint256[],bytes[])`
     */
    function _execute(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) internal virtual returns (bytes[] memory) {
        if (
            operationsType.length != targets.length ||
            (targets.length != values.length || values.length != datas.length)
        ) revert ERC725X_ExecuteParametersLengthMismatch();

        bytes[] memory result = new bytes[](operationsType.length);

        for (uint256 i = 0; i < operationsType.length; i = _uncheckedIncrementERC725X(i)) {
            result[i] = _execute(operationsType[i], targets[i], values[i], datas[i]);
        }

        return result;
    }

    /**
     * @dev perform low-level call (operation type = 0)
     * @param target The address on which call is executed
     * @param value The value to be sent with the call
     * @param data The data to be sent with the call
     * @return result The data from the call
     */
    function _executeCall(
        address target,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }

        emit Executed(OPERATION_0_CALL, target, value, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.call{value: value}(data);
        result = AddressUpgradeable.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level staticcall (operation type = 3)
     * @param target The address on which staticcall is executed
     * @param data The data to be sent with the staticcall
     * @return result The data returned from the staticcall
     */
    function _executeStaticCall(
        address target,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        emit Executed(OPERATION_3_STATICCALL, target, 0, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.staticcall(data);
        result = AddressUpgradeable.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level delegatecall (operation type = 4)
     * @param target The address on which delegatecall is executed
     * @param data The data to be sent with the delegatecall
     * @return result The data returned from the delegatecall
     */
    function _executeDelegateCall(
        address target,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        emit Executed(OPERATION_4_DELEGATECALL, target, 0, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.delegatecall(data);
        result = AddressUpgradeable.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev deploy a contract using the CREATE opcode (operation type = 1)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s)
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate(
        uint256 value,
        bytes memory creationCode
    ) internal virtual returns (bytes memory newContract) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }

        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        address contractAddress;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            contractAddress := create(value, add(creationCode, 0x20), mload(creationCode))
        }

        if (contractAddress == address(0)) {
            revert ERC725X_ContractDeploymentFailed();
        }

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(OPERATION_1_CREATE, contractAddress, value, bytes32(0));
    }

    /**
     * @dev deploy a contract using the CREATE2 opcode (operation type = 2)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s) and a bytes32 salt
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate2(
        uint256 value,
        bytes memory creationCode
    ) internal virtual returns (bytes memory newContract) {
        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        bytes32 salt = BytesLib.toBytes32(creationCode, creationCode.length - 32);
        bytes memory bytecode = BytesLib.slice(creationCode, 0, creationCode.length - 32);
        address contractAddress = Create2Upgradeable.deploy(value, salt, bytecode);

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(OPERATION_2_CREATE2, contractAddress, value, salt);
    }

    /**
     * @dev Will return unchecked incremented uint256
     *      can be used to save gas when iterating over loops
     */
    function _uncheckedIncrementERC725X(uint256 i) internal pure returns (uint256) {
        unchecked {
            return i + 1;
        }
    }
}
