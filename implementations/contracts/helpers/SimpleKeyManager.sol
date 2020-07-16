// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// interfaces
import "../IERC1271.sol";
import "../ERC725/IERC725X.sol";

// modules
import "@openzeppelin/contracts/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// libraries
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract SimpleKeyManager is ERC165, IERC1271, AccessControl {

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    // keccak256("EXECUTOR_ROLE")
    bytes32 public constant EXECUTOR_ROLE = 0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63;

    IERC725X public Account;

    // EVENTS
    event Executed(uint256 indexed _operation, address indexed _to, uint256 indexed  _value, bytes _data);

    constructor(address _account, address _newOwner)
    public
    {
        // make owner an executor
        _setupRole(DEFAULT_ADMIN_ROLE, _newOwner);
        _setupRole(EXECUTOR_ROLE, _newOwner);

        // Link account
        Account = IERC725X(_account);

        _registerInterface(_INTERFACE_ID_ERC1271);
    }


    function execute(uint256 _operationType, address _to, uint256 _value, bytes memory _data)
    external
    payable
    {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), 'Only executors are allowed');

        Account.execute(_operationType, _to, _value, _data);
        emit Executed(_operationType, _to, _value, _data);
    }

    /**
    * @notice Checks if an owner signed `_data`.
    * ERC1271 interface.
    *
    * @param _hash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
    * @param _signature owner's signature(s) of the data
    */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
    override
    public
    view
    returns (bytes4 magicValue)
    {
        address recoveredAddress = ECDSA.recover(_hash, _signature);

        return (hasRole(EXECUTOR_ROLE, recoveredAddress) || hasRole(DEFAULT_ADMIN_ROLE, recoveredAddress))
        ? _INTERFACE_ID_ERC1271
        : _ERC1271FAILVALUE;
    }
}

