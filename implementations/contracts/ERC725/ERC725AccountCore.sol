// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../interfaces/IERC1271.sol";
import "../interfaces/ILSP1_UniversalReceiver.sol";
import "../interfaces/ILSP1_UniversalReceiverDelegate.sol";

// modules
import "./ERC725XCore.sol";
import "./ERC725YCore.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../helpers/UtilsLib.sol";
import "../Utils/ERC725Utils.sol";

// constants
import "../Constants.sol";
import "../InterfaceIDs.sol";

/**
 * @title Abstract (Core) implementation of ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 */
abstract contract ERC725AccountCore is ERC725XCore, ERC725YCore, ILSP1, IERC1271 {
    using ERC725Utils for IERC725Y;

    event ValueReceived(address indexed sender, uint256 indexed value);

    receive() external payable{
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
        bytes memory receiverData = IERC725Y(this).getDataSingle(_UNIVERSAL_RECEIVER_DELEGATE_KEY);
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