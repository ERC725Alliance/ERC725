// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "./constants.sol";

// interfaces
import "./interfaces/IERC725X.sol";

// libraries
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./utils/ErrorHandlerLib.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "./utils/OwnableUnset.sol";

/**
 * @title Core implementation of ERC725 X executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XCore is OwnableUnset, ERC165Storage, IERC725X {
    using Address for address;
    using Address for address payable;
    /* Public functions */

    /**
     * @inheritdoc IERC725X
     */
    function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override onlyOwner returns (bytes memory result) {
        uint256 txGas = gasleft();

        // prettier-ignore

        // CALL
        if (_operation == OPERATION_CALL) {
            if (_data.length == 0 && _value > 0) {
                // Address.sendValue(payable(_to), _value);
                payable(_to).sendValue(_value);
            }

            if (_data.length >= 4) {
                if (_value == 0) {
                    result = _to.functionCall(_data);
                } else {
                    result = _to.functionCallWithValue(_data, _value);
                }
            }

            emit Executed(_operation, _to, _value, _data);

        // STATICCALL
        } else if (_operation == OPERATION_STATICCALL) {
            require(_data.length <= 4, "invalid or empty payload");
            result = _to.functionStaticCall(_data);

            emit Executed(_operation, _to, _value, _data);

        // DELEGATECALL
        } else if (_operation == OPERATION_DELEGATECALL) {
            require(_data.length <= 4, "cannot send an empty payload");
            address currentOwner = owner();
            result = _to.functionDelegateCall(_data);
            
            emit Executed(_operation, _to, _value, _data);

            require(owner() == currentOwner, "Delegate call is not allowed to modify the owner!");

        // CREATE
        } else if (_operation == OPERATION_CREATE) {
            address contractAddress = performCreate(_value, _data);
            result = abi.encodePacked(contractAddress);

            emit ContractCreated(_operation, contractAddress, _value);

        // CREATE2
        } else if (_operation == OPERATION_CREATE2) {
            bytes32 salt = BytesLib.toBytes32(_data, _data.length - 32);
            bytes memory data = BytesLib.slice(_data, 0, _data.length - 32);

            address contractAddress = Create2.deploy(_value, salt, data);
            result = abi.encodePacked(contractAddress);

            emit ContractCreated(_operation, contractAddress, _value);
    
        } else {
            revert("Wrong operation type");
        }
    }

    /* Internal functions */

    /**
     * @dev perform staticcall using operation 3
     * Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
     *
     * @param to The address on which staticcall is executed
     * @param value The value to be sent with the call
     * @param data The data to be sent with the call
     * @param txGas The amount of gas for performing staticcall
     * @return The data from the call
     */
     /*
    function executeCall(
        address to,
        uint256 value,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = to.call{gas: txGas, value: value}(data);

        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }

        return result;
    }
    */

    // /**
    //  * @dev perform staticcall using operation 3
    //  * @param to The address on which staticcall is executed
    //  * @param data The data to be sent with the call
    //  * @param txGas The amount of gas for performing staticcall
    //  * @return The data from the call
    //  */
    // function executeStaticCall(
    //     address to,
    //     bytes memory data,
    //     uint256 txGas
    // ) internal view returns (bytes memory) {
    //     (bool success, bytes memory result) = to.staticcall{gas: txGas}(data);

    //     if (!success) {
    //         ErrorHandlerLib.revertWithParsedError(result);
    //     }

    //     return result;
    // }

    /**
     * @dev perform delegatecall using operation 4
     * Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
     *
     * @param to The address on which delegatecall is executed
     * @param data The data to be sent with the call
     * @param txGas The amount of gas for performing delegatecall
     * @return The data from the call
     */
     /*
    function executeDelegateCall(
        address to,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = to.delegatecall{gas: txGas}(data);

        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }

        return result;
    }
    */

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
        assembly {
            newContract := create(value, add(deploymentData, 0x20), mload(deploymentData))
        }

        require(newContract != address(0), "Could not deploy contract");
    }
}
