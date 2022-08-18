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
// prettier-ignore
import {
    _INTERFACEID_ERC725X,
    OPERATION_CALL, 
    OPERATION_DELEGATECALL, 
    OPERATION_STATICCALL, 
    OPERATION_CREATE, 
    OPERATION_CREATE2
} from "./constants.sol";

/**
 * @title Core implementation of ERC725 X executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XCore is OwnableUnset, ERC165, IERC725X {
    /* Public functions */

    /**
     * @inheritdoc IERC725X
     */
    function execute(
        uint256 operation,
        address to,
        uint256 value,
        bytes calldata data
    ) public payable virtual override onlyOwner returns (bytes memory result) {
        uint256 txGas = gasleft();

        // CALL
        if (operation == OPERATION_CALL) {
            require(address(this).balance >= value, "ERC725X: insufficient balance for call");

            result = executeCall(to, value, data, txGas);

            emit Executed(operation, to, value, bytes4(data));

            // STATICCALL
        } else if (operation == OPERATION_STATICCALL) {
            require(value == 0, "ERC725X: cannot transfer value with operation STATICCALL");

            result = executeStaticCall(to, data, txGas);

            emit Executed(operation, to, value, bytes4(data));

            // DELEGATECALL
            // WARNING!
            // delegatecall is a dangerous operation type!
            //
            // delegate allows to call another deployed contract and use its functions
            // to update the state of the current calling contract
            //
            // this can lead to unexpected behaviour on the contract storage, such as:
            //
            // - updating any state variables (even if these are protected)
            // - update the contract owner
            // - run selfdestruct in the context of this contract
            //
            // use with EXTRA CAUTION
        } else if (operation == OPERATION_DELEGATECALL) {
            require(value == 0, "ERC725X: cannot transfer value with operation DELEGATECALL");

            result = executeDelegateCall(to, data, txGas);

            emit Executed(operation, to, value, bytes4(data));

            // CREATE
        } else if (operation == OPERATION_CREATE) {
            require(
                to == address(0),
                "ERC725X: CREATE operations require the receiver address to be empty"
            );
            require(address(this).balance >= value, "ERC725X: insufficient balance for call");

            address contractAddress = performCreate(value, data);
            result = abi.encodePacked(contractAddress);

            emit ContractCreated(operation, contractAddress, value);

            // CREATE2
        } else if (operation == OPERATION_CREATE2) {
            require(
                to == address(0),
                "ERC725X: CREATE operations require the receiver address to be empty"
            );
            require(address(this).balance >= value, "ERC725X: insufficient balance for call");

            bytes32 salt = BytesLib.toBytes32(data, data.length - 32);
            bytes memory bytecode = BytesLib.slice(data, 0, data.length - 32);

            address contractAddress = Create2.deploy(value, salt, bytecode);
            result = abi.encodePacked(contractAddress);

            emit ContractCreated(operation, contractAddress, value);
        } else {
            revert("Wrong operation type");
        }
    }

    /* Internal functions */

    /**
     * @dev perform call using operation 0
     * Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
     *
     * @param to The address on which call is executed
     * @param value The value to be sent with the call
     * @param data The data to be sent with the call
     * @param txGas The amount of gas for performing call
     * @return result The data from the call
     */
    function executeCall(
        address to,
        uint256 value,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory result) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.call{gas: txGas, value: value}(data);

        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform staticcall using operation 3
     * @param to The address on which staticcall is executed
     * @param data The data to be sent with the call
     * @param txGas The amount of gas for performing staticcall
     * @return result The data from the call
     */
    function executeStaticCall(
        address to,
        bytes memory data,
        uint256 txGas
    ) internal view returns (bytes memory result) {
        (bool success, bytes memory returnData) = to.staticcall{gas: txGas}(data);

        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform delegatecall using operation 4
     * Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
     *
     * @param to The address on which delegatecall is executed
     * @param data The data to be sent with the call
     * @param txGas The amount of gas for performing delegatecall
     * @return result The data from the call
     */
    function executeDelegateCall(
        address to,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory result) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = to.delegatecall{gas: txGas}(data);

        result = Address.verifyCallResult(success, returnData, "ERC725X: Unknown Error");
    }

    /**
     * @dev perform contract creation using operation 1
     * Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/CreateCall.sol
     *
     * @param value The value to be sent to the contract created
     * @param deploymentData The contract bytecode to deploy
     * @return newContract The address of the contract created
     */
    function performCreate(uint256 value, bytes memory deploymentData)
        internal
        returns (address newContract)
    {
        require(deploymentData.length != 0, "no contract bytecode provided");

        // solhint-disable no-inline-assembly
        assembly {
            newContract := create(value, add(deploymentData, 0x20), mload(deploymentData))
        }

        require(newContract != address(0), "Could not deploy contract");
    }

    /* Overrides functions */

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
}
