// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./ERC725X.sol";
import "./ERC725Y.sol";

/**
 * @title ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725X and ERC725Y together into one smart contract
 */
contract ERC725 is ERC725X, ERC725Y {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract
     */
    // solhint-disable no-empty-blocks
    constructor(address _newOwner) ERC725X(_newOwner) ERC725Y(_newOwner) {}

    // NOTE this implementation has not by default: receive() external payable {}

    /* Overrides functions */

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725X, ERC725Y)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
