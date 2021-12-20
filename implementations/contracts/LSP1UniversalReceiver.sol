// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "./constants.sol";

// interfaces
import "./interfaces/IERC725Y.sol";
import "./interfaces/ILSP1UniversalReceiver.sol";
import "./interfaces/ILSP1UniversalReceiverDelegate.sol";

// libraries
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./utils/ERC725Utils.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Abstract contract with universalReceiver function to be inherited in other contracts
 */
abstract contract LSP1UniversalReceiver is ILSP1UniversalReceiver, Context {
    using ERC725Utils for IERC725Y;

    /**
     * @dev IERC725Y type variable representing the account from where to retrieve the keys
     */
    IERC725Y public erc725Y;

    /**
     * @inheritdoc ILSP1UniversalReceiver
     */
    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory data = IERC725Y(erc725Y).getDataSingle(_UNIVERSAL_RECEIVER_DELEGATE_KEY);

        if (data.length >= 20) {
            address universalReceiverAddress = BytesLib.toAddress(data, 0);
            if (
                ERC165Checker.supportsInterface(
                    universalReceiverAddress,
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                returnValue = ILSP1UniversalReceiverDelegate(universalReceiverAddress)
                    .universalReceiverDelegate(_msgSender(), _typeId, _data);
            }
        }
        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);
    }
}
