// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./ERC725XInitAbstract.sol";
import "./ERC725YInitAbstract.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
abstract contract ERC725InitAbstract is ERC725XInitAbstract, ERC725YInitAbstract {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract
     */
    function initialize(address _newOwner)
        public
        virtual
        override(ERC725XInitAbstract, ERC725YInitAbstract)
        onlyInitializing
    {
        ERC725XInitAbstract.initialize(_newOwner);
        ERC725YInitAbstract.initialize(_newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}
}
