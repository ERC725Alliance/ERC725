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
    OPERATION_TYPE
} from "./constants.sol";

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
        require(address(this).balance >= value, "ERC725X: insufficient balance");
        return _execute(operationType, to, value, data);
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

    function _execute(
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory) {
        // CALL
        if (operation == uint256(OPERATION_TYPE.CALL)) return _executeCall(to, value, data);

        // Deploy with CREATE
        if (operation == uint256(OPERATION_TYPE.CREATE)) return _deployCreate(to, value, data);

        // Deploy with CREATE2
        if (operation == uint256(OPERATION_TYPE.CREATE2)) return _deployCreate2(to, value, data);

        // STATICCALL
        if (operation == uint256(OPERATION_TYPE.STATICCALL)) return _executeStaticCall(to, value, data);

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
        if (operation == uint256(OPERATION_TYPE.DELEGATECALL)) return _executeDelegateCall(to, value, data);

        revert("ERC725X: Unknown operation type");
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
        emit Executed(uint256(OPERATION_TYPE.CALL), to, value, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.call{value: value}(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level staticcall (operation type = 3)
     * @param to The address on which staticcall is executed
     * @param value The value passed to the execute(...) function (MUST be 0)
     * @param data The data to be sent with the staticcall
     * @return result The data returned from the staticcall
     */
    function _executeStaticCall(
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        require(value == 0, "ERC725X: cannot transfer value with operation STATICCALL");

        emit Executed(uint256(OPERATION_TYPE.STATICCALL), to, value, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.staticcall(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform low-level delegatecall (operation type = 4)
     * @param to The address on which delegatecall is executed
     * @param value The value passed to the execute(...) function (MUST be 0)
     * @param data The data to be sent with the delegatecall
     * @return result The data returned from the delegatecall
     */
    function _executeDelegateCall(
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        require(value == 0, "ERC725X: cannot transfer value with operation DELEGATECALL");

        emit Executed(uint256(OPERATION_TYPE.DELEGATECALL), to, value, bytes4(data));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.delegatecall(data);
        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev deploy a contract using the CREATE opcode (operation type = 1)
     * @param to The recipient address passed to execute(...) (MUST be address(0) for CREATE)
     * @param value The value to be sent to the contract created
     * @param data The contract bytecode to deploy
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate(
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory newContract) {
        require(
            to == address(0),
            "ERC725X: CREATE operations require the receiver address to be empty"
        );
        require(data.length != 0, "ERC725X: No contract bytecode provided");

        address contractAddress;
        // solhint-disable no-inline-assembly
        assembly {
            contractAddress := create(value, add(data, 0x20), mload(data))
        }

        require(contractAddress != address(0), "ERC725X: Could not deploy contract");

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(uint256(OPERATION_TYPE.CREATE), contractAddress, value);
    }

    /**
     * @dev deploy a contract using the CREATE2 opcode (operation type = 2)
     * @param to The recipient address passed to execute(...) (MUST be address(0) for CREATE2)
     * @param value The value to be sent to the contract created
     * @param data The contract bytecode to deploy appended with a bytes32 salt
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate2(
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory newContract) {
        require(
            to == address(0),
            "ERC725X: CREATE operations require the receiver address to be empty"
        );
        require(data.length != 0, "ERC725X: No contract bytecode provided");

        bytes32 salt = BytesLib.toBytes32(data, data.length - 32);
        bytes memory bytecode = BytesLib.slice(data, 0, data.length - 32);
        address contractAddress = Create2.deploy(value, salt, bytecode);

        newContract = abi.encodePacked(contractAddress);
        emit ContractCreated(uint256(OPERATION_TYPE.CREATE2), contractAddress, value);
    }
}
