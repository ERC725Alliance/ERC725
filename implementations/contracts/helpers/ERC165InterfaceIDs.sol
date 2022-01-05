// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "../constants.sol";

/**
 * @dev Contract used to calculate interfacesId
 */
contract ERC165InterfaceIDs {
    function getERC725XInterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_ERC725X == type(IERC725X).interfaceId);
        return _INTERFACEID_ERC725X;
    }

    function getERC725YInterfaceID() public pure returns (bytes4) {
        require(_INTERFACEID_ERC725Y == type(IERC725Y).interfaceId);
        return _INTERFACEID_ERC725Y;
    }
}
