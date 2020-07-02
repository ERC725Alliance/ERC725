// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// modules
import "./ERC725.sol";
import "../IERC1271.sol";

// libraries
import "../../node_modules/@openzeppelin/contracts/cryptography/ECDSA.sol";
import "../helpers/UtilsLib.sol";

/**
 * @title ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725Account is ERC725, IERC1271  {

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner)
    ERC725(_newOwner)
    public {
        _registerInterface(_INTERFACE_ID_ERC1271);
    }

    receive()
    external
    payable
    {
//        if (msg.sig != bytes4(0)) {
//            address root = owner();
//            assembly {
//                let ptr := mload(0x40)
//                calldatacopy(ptr, 0, calldatasize)
//                let result := call(gas, root, 0, ptr, calldatasize, 0, 0)
//                let size := returndatasize
//                returndatacopy(ptr, 0, size)
//                switch result
//                case 0  { revert (ptr, size) }
//                default { return (ptr, size) }
//            }
//        }
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
        if (
            UtilsLib.isContract(owner()) &&
            supportsInterface(_INTERFACE_ID_ERC1271)
        ){
            return IERC1271(owner()).isValidSignature(_hash, _signature);
        } else {
            return owner() == ECDSA.recover(_hash, _signature)
            ? _INTERFACE_ID_ERC1271
            : _ERC1271FAILVALUE;
        }
    }
}
