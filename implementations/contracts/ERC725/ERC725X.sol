// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// interfaces
import "./IERC725X.sol";

// modules
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";

// libraries
import "@openzeppelin/contracts/utils/Create2.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

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
contract ERC725X is ERC165, Ownable, IERC725X  {

    bytes4 internal constant _INTERFACE_ID_ERC725X = 0x44c028fe;
    
    uint256 constant CALL = 0;
    uint256 constant DELEGATECALL = 1;
    uint256 constant CREATE2 = 2;
    uint256 constant CREATE = 3;


    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) public {
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if(_newOwner != owner()) {
            transferOwnership(_newOwner);
        }

        _registerInterface(_INTERFACE_ID_ERC725X);
    }

    /* Public functions */

    /**
     * @notice Executes any other smart contract. Is only callable by the owner.
     *
     *
     * @param operation the operation to execute: CALL = 0; DELEGATECALL = 1; CREATE2 = 2; CREATE = 3;
     * @param to the smart contract or address to interact with. `_to` will be unused if a contract is created (operation 2 and 3)
     * @param value the value of ETH to transfer
     * @param data the call data, or the contract data to deploy
     */
    function execute(uint256 operation, address to, uint256 value, bytes memory data)
    external
    payable
    override
    onlyOwner
    returns (bool success, bytes memory returnData)
    {
        require(operation <= 3,"Wrong Operation type");
        // CALL
        if (operation == CALL)
            (success, returnData) = executeCall(to, value, data);
        
        // DELEGATE CALL
        // TODO: risky as storage slots can be overridden, remove?
        if (operation == DELEGATECALL)
            (success, returnData) = executeDelegatecall(to, data);
        
        // CREATE2
        if (operation == CREATE2)
            (success, returnData) = executeCreate2(value, data);
        
        // CREATE
        if (operation == CREATE)
           (success, returnData) = executeCreate(value, data);

        // emit event
        emit Executed(operation, to, value, data);
    }

    /* Internal functions */
    function executeCall(address _to, uint256 _value, bytes memory _data)
    internal
    returns (bool success, bytes memory returnData)
    {
        (success, returnData) = _to.call{value: _value}(_data);
    }

    function executeDelegatecall(address _to, bytes memory _data)
    internal
    returns (bool success, bytes memory returnData)
    {
        address currentOwner = owner();
        (success, returnData) = _to.delegatecall(_data);
        require(owner() == currentOwner, "Delegate call is not allowed to modify the owner!");
    }

    function executeCreate2(uint256 _value, bytes memory _data) internal returns(bool success, bytes memory) {
        bytes32 salt = BytesLib.toBytes32(_data, _data.length - 32);
        bytes memory data = BytesLib.slice(_data, 0, _data.length - 32);

        address contractAddress = Create2.deploy(_value, salt, data);

        emit ContractCreated(contractAddress);

        return(true,abi.encodePacked(contractAddress));
   
    }

    // Taken from GnosisSafe
    // https://github.com/gnosis/safe-contracts/blob/development/contracts/libraries/CreateCall.sol
    function executeCreate(uint256 _value, bytes memory _data) internal returns(bool success,bytes memory) {
        // solium-disable-next-line security/no-inline-assembly
        address newContract;
        assembly {
            newContract := create(_value, add(_data, 0x20), mload(_data))
        }
        require(newContract != address(0), "Could not deploy contract");
        emit ContractCreated(newContract);
        return (true, abi.encodePacked(newContract));
    }
}
