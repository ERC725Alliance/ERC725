// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725.sol";
import "../IERC1271.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../helpers/UtilsLib.sol";
import "../Utils/ERC725Utils.sol";

// interfaces
import "../ILSP1/ILSP1_UniversalReceiver.sol";
import "../ILSP1/ILSP1_UniversalReceiverDelegate.sol";

/**
 * @title ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */

// TODO add ERC777, ERC223, ERC721 functions?

contract ERC725Account is ERC725, IERC1271 , ILSP1 {
    using ERC725Utils for ERC725Y;

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;
    bytes4 constant _INTERFACE_ID_LSP1 = 0x6bb56a14;
    bytes4 constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 constant private _UNIVERSAL_RECEIVER_DELEGATE_KEY =
    0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")

    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) ERC725(_newOwner) {
        // set SupportedStandards > ERC725Account
        bytes32 key = bytes32(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6); // SupportedStandards > ERC725Account
        store[key] = abi.encodePacked(bytes4(0xafdeb5d6)); // bytes4(keccak256('ERC725Account')
        emit DataChanged(key, store[key]);

        _registerInterface(_INTERFACE_ID_ERC1271);
        _registerInterface(_INTERFACE_ID_LSP1);
    }

    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
    }

//    TODO to be discussed
//    function fallback()
//    public
//    {
//        address to = owner();
//        assembly {
//            calldatacopy(0, 0, calldatasize())
//            let result := staticcall(gas(), to, 0, calldatasize(), 0, 0)
//            returndatacopy(0, 0, returndatasize())
//            switch result
//            case 0  { revert (0, returndatasize()) }
//            default { return (0, returndatasize()) }
//        }
//    }


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


        function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        override
        virtual
        returns (bytes memory returnValue)
    {
        bytes memory receiverData = ERC725Y(this).getDataSingle(_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        returnValue = "";

        // call external contract
        if (receiverData.length == 20) {
            address universalReceiverAddress = BytesLib.toAddress(receiverData, 0);
            
            if(ERC165(universalReceiverAddress).supportsInterface(_INTERFACE_ID_LSP1DELEGATE)) {
                returnValue = ILSP1Delegate(universalReceiverAddress).universalReceiverDelegate(
                    _msgSender(), 
                    _typeId, 
                    _data
                );
            }
        }

        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);
        
        return returnValue;
    }
}
