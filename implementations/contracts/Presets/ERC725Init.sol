// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725Upgradeable} from "../ERC725Upgradeable.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
contract ERC725Init is ERC725Upgradeable {
    /**
     * @dev Deploy + lock base contract deployment on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    function initialize(address newOwner) public virtual initializer {
        ERC725Upgradeable.__ERC725_init(newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}
}
