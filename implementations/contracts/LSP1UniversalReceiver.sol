// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interface
import "./interfaces/IERC725Y.sol";
import "./interfaces/ILSP1UniversalReceiver.sol";
import "./interfaces/ILSP1UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// library
import "./utils/ERC725Utils.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

// constants
import "./constants.sol";

abstract contract LSP1UniversalReceiver is ILSP1UniversalReceiver, Context {
    using ERC725Utils for IERC725Y;
    IERC725Y public erc725Y;

    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory receiverData = IERC725Y(erc725Y).getDataSingle(
            _UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        returnValue = "";

        // call external contract
        if (receiverData.length == 20) {
            address universalReceiverAddress = BytesLib.toAddress(receiverData, 0);

            if (ERC165(universalReceiverAddress).supportsInterface(_INTERFACEID_LSP1_DELEGATE)) {
                returnValue = ILSP1UniversalReceiverDelegate(universalReceiverAddress)
                    .universalReceiverDelegate(_msgSender(), _typeId, _data);
            }
        }

        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);

        return returnValue;
    }
}
