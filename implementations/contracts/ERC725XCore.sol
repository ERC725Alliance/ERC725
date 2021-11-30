// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./interfaces/IERC725X.sol";

// modules
import "./utils/OwnableUnset.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// libraries
import "@openzeppelin/contracts/utils/Create2.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

// constants
import "./constants.sol";

/**
 * @title ERC725 X (Core) executor
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall`, as well creating contracts using `create` and `create2`.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 *
 * `execute` MUST only be called by the owner of the contract set via ERC173.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
abstract contract ERC725XCore is OwnableUnset, ERC165Storage, IERC725X {
    /* Public functions */

    /**
     * @notice Executes any other smart contract. Is only callable by the owner.
     *
     *
     * @param _operation the operation to execute: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4;
     * @param _to the smart contract or address to interact with. `_to` will be unused if a contract is created (operation 1 and 2)
     * @param _value the value of ETH to transfer
     * @param _data the call data, or the contract data to deploy
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
            result = executeCall(_to, _value, _data, txGas);

            emit Executed(_operation, _to, _value, _data);

        // STATICCALL
        } else if (_operation == OPERATION_STATICCALL) {
            result = executeStaticCall(_to, _data, txGas);

            emit Executed(_operation, _to, _value, _data);

        // DELEGATECALL
        } else if (_operation == OPERATION_DELEGATECALL) {
            address currentOwner = owner();
            result = executeDelegateCall(_to, _data, txGas);
            
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

    // Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
    function executeCall(
        address to,
        uint256 value,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = to.call{gas: txGas, value: value}(data);

        if (!success) {
            // solhint-disable reason-string
            if (result.length < 68) revert();

            // solhint-disable no-inline-assembly
            assembly {
                result := add(result, 0x04)
            }
            revert(abi.decode(result, (string)));
        }

        return result;
    }

    function executeStaticCall(
        address to,
        bytes memory data,
        uint256 txGas
    ) internal view returns (bytes memory) {
        (bool success, bytes memory result) = to.staticcall{gas: txGas}(data);

        if (!success) {
            // solhint-disable reason-string
            if (result.length < 68) revert();

            assembly {
                result := add(result, 0x04)
            }
            revert(abi.decode(result, (string)));
        }

        return result;
    }

    // Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/base/Executor.sol
    function executeDelegateCall(
        address to,
        bytes memory data,
        uint256 txGas
    ) internal returns (bytes memory) {
        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = to.delegatecall{gas: txGas}(data);

        if (!success) {
            // solhint-disable reason-string
            if (result.length < 68) revert();

            assembly {
                result := add(result, 0x04)
            }
            revert(abi.decode(result, (string)));
        }

        return result;
    }

    // Taken from GnosisSafe: https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/CreateCall.sol
    function performCreate(uint256 value, bytes memory deploymentData)
        internal
        returns (address newContract)
    {
        assembly {
            newContract := create(value, add(deploymentData, 0x20), mload(deploymentData))
        }

        require(newContract != address(0), "Could not deploy contract");
    }
}
