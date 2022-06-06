// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725InitAbstract} from "./ERC725InitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
contract ERC725Init is ERC725InitAbstract {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    function initialize(address newOwner) public virtual initializer {
        ERC725InitAbstract._initialize(newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}
}
