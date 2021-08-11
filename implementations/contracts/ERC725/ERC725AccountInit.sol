// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725Init.sol";
import "../IERC1271.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../helpers/UtilsLib.sol";

/**
 * @title ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */

// TODO add ERC777, ERC223, ERC721 functions?

contract ERC725AccountInit is Initializable, ERC725Init, IERC1271  {

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    event ValueReceived(address indexed sender, uint256 indexed value);

    function initialize(address _newOwner) virtual override public initializer {
        ERC725Init.initialize(_newOwner);
        // set SupportedStandards > ERC725Account
        bytes32 key = bytes32(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6); // SupportedStandards > ERC725Account
        store[key] = abi.encodePacked(bytes4(0xafdeb5d6)); // bytes4(keccak256('ERC725Account')
        emit DataChanged(key, store[key]);

        _registerInterface(_INTERFACE_ID_ERC1271);
    }

    // /**
    //  * @notice Sets the owner of the contract
    //  * @param _newOwner the owner of the contract.
    //  */
    // constructor(address _newOwner)
    // ERC725(_newOwner)
    // {
    //     // // set SupportedStandards > ERC725Account
    //     // bytes32 key = bytes32(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6); // SupportedStandards > ERC725Account
    //     // store[key] = abi.encodePacked(bytes4(0xafdeb5d6)); // bytes4(keccak256('ERC725Account')
    //     // emit DataChanged(key, store[key]);

    //     // _registerInterface(_INTERFACE_ID_ERC1271);
    // }

    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
    }

    // TODO to be discussed
    // function fallback() public {
    //     address to = owner();
    //     assembly {
    //         calldatacopy(0, 0, calldatasize())
    //         let result := staticcall(gas(), to, 0, calldatasize(), 0, 0)
    //         returndatacopy(0, 0, returndatasize())
    //         switch result
    //         case 0  { revert (0, returndatasize()) }
    //         default { return (0, returndatasize()) }
    //     }
    // }


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
        // if OWNER is a contract
        if (UtilsLib.isContract(owner())) {
            return supportsInterface(_INTERFACE_ID_ERC1271)
            ? IERC1271(owner()).isValidSignature(_hash, _signature)
            : _ERC1271FAILVALUE;

        // if OWNER is a key
        } else {
            return owner() == ECDSA.recover(_hash, _signature)
            ? _INTERFACE_ID_ERC1271
            : _ERC1271FAILVALUE;
        }
    }
}
