// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "../ERC725/ERC725Account.sol";

// constants
import "../InterfaceIDs.sol";

contract ERC165InterfaceIDs {
    function getERC725XInterfaceID() public pure returns (bytes4) {
        return _INTERFACE_ID_ERC725X;
    }

    function getERC725YInterfaceID() public pure returns (bytes4) {
        return _INTERFACE_ID_ERC725Y;
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
        assert(result == _INTERFACE_ID_ERC725ACCOUNT);

        return result;
    }
}
