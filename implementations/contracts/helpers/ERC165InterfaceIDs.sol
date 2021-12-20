// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "../ERC725Account.sol";

// constants
import "../constants.sol";

// modules
import "../ERC725Account.sol";

/**
 * @dev Contract used to calculate interfacesId
 */
contract ERC165InterfaceIDs {
    function getERC1271InterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_ERC1271 == type(IERC1271).interfaceId);
        return _INTERFACEID_ERC1271;
    }

    function getERC725XInterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_ERC725X == type(IERC725X).interfaceId);
        return _INTERFACEID_ERC725X;
    }

    function getERC725YInterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_ERC725Y == type(IERC725Y).interfaceId);
        return _INTERFACEID_ERC725Y;
    }

    function calculateERC725AccountInterfaceID() public pure returns (bytes4) {
        ERC725Account i;

        // prettier-ignore

        // Owner and transferOwnership are left for purpose
        bytes4 result = i.getData.selector
            ^ i.setData.selector
            ^ i.execute.selector
            ^ i.universalReceiver.selector
            ^ i.isValidSignature.selector;

        // ensure we have not hardcoded an incorrect value for the constant _INTERFACE_ID_ERC725ACCOUNT
        require(
            result == _INTERFACEID_ERC725ACCOUNT,
            "calculateERC725AccountInterfaceID: XOR result does not match value stored in constant _INTERFACE_ID_ERC725ACCOUNT"
        );

        return result;
    }

    function getLSP1InterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_LSP1 == type(ILSP1UniversalReceiver).interfaceId);
        return _INTERFACEID_LSP1;
    }

    function getLSP1DelegateInterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_LSP1_DELEGATE == type(ILSP1UniversalReceiverDelegate).interfaceId);
        return _INTERFACEID_LSP1_DELEGATE;
    }
}
