pragma solidity ^0.5.4;

import "./ERC725.sol";

contract ProxyAccount is ERC725 {
    
    uint256 constant OPERATION_CALL = 0;
    uint256 constant OPERATION_CREATE = 1;
    // bytes32 constant KEY_OWNER = 0x0000000000000000000000000000000000000000000000000000000000000000;

    mapping(bytes32 => bytes) store;
    
    address public owner;
    
    constructor(address _owner) public {
        owner = _owner;
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "only-owner-allowed");
        _;
    }
    
    // function toAddress(bytes32 a) internal pure returns (address b){
    //   assembly {
    //         mstore(0, a)
    //         b := mload(0)
    //     }
    //   return b;
    // }
    
    // function toBytes32(address a) internal pure returns (bytes32 b){
    //   assembly {
    //         mstore(0, a)
    //         b := mload(0)
    //     }
    //   return b;
    // }
    
    // ----------------
    // Public functions
    
    function () external payable {}
    
    function changeOwner(address _owner)
        external
        onlyOwner
    {
        owner = _owner;
        emit OwnerChanged(owner);
    }

    function getData(bytes32 _key)
        external
        view
        returns (bytes memory _value)
    {
        return store[_key];
    }

    function setData(bytes32 _key, bytes calldata _value)
        external
        onlyOwner
    {
        store[_key] = _value;
        emit DataChanged(_key, _value);
    }

    function execute(uint256 _operationType, address _to, uint256 _value, bytes calldata _data)
        external
        onlyOwner
    {
        if (_operationType == OPERATION_CALL) {
            executeCall(_to, _value, _data);
        } else if (_operationType == OPERATION_CREATE) {
            address newContract = executeCreate(_data);
            emit ContractCreated(newContract);
        } else {
            // We don't want to spend users gas if parametar is wrong
            revert();
        }
    }

    // copied from GnosisSafe
    // https://github.com/gnosis/safe-contracts/blob/v0.0.2-alpha/contracts/base/Executor.sol
    function executeCall(address to, uint256 value, bytes memory data)
        internal
        returns (bool success)
    {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := call(gas, to, value, add(data, 0x20), mload(data), 0, 0)
        }
    }

    // copied from GnosisSafe
    // https://github.com/gnosis/safe-contracts/blob/v0.0.2-alpha/contracts/base/Executor.sol
    function executeCreate(bytes memory data)
        internal
        returns (address newContract)
    {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            newContract := create(0, add(data, 0x20), mload(data))
        }
    }
}
