// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./ERC725XCore.sol";

// modules
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC725 X executor
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, as well creating contracts using `create` and `create2`.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 *
 * `execute` MUST only be called by the owner of the contract set via ERC173.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725X is Ownable, ERC725XCore {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) {
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if (_newOwner != owner()) {
            transferOwnership(_newOwner);
        }

        _registerInterface(_INTERFACE_ID_ERC725X);
    }

    function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override onlyOwner returns(bytes memory result) {
         // emit event
        emit Executed(_operation, _to, _value, _data);

        uint256 txGas = gasleft() - 2500;

        // CALL
        if (_operation == OPERATION_CALL) {
           result = executeCall(_to, _value, _data, txGas);

          // DELEGATECALL
        } else if (_operation == OPERATION_DELEGATECALL) {
            address currentOwner = owner();
            result = executeDelegateCall(_to, _data, txGas);

            require(owner() == currentOwner, "Delegate call is not allowed to modify the owner!");

            // CREATE
        } else if (_operation == OPERATION_CREATE) {
            address contractAddress = performCreate(_value, _data);
            result = abi.encodePacked(contractAddress);

            // CREATE2
        } else if (_operation == OPERATION_CREATE2) {
            bytes32 salt = BytesLib.toBytes32(_data, _data.length - 32);
            bytes memory data = BytesLib.slice(_data, 0, _data.length - 32);

            address contractAddress = Create2.deploy(_value, salt, data);
            result = abi.encodePacked(contractAddress);

            emit ContractCreated(contractAddress);
        } else {
            revert("Wrong operation type");
        }
    }
    
}
