// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725Init} from "../ERC725Init.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
contract ERC725InitDeploy is ERC725Init {
    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner) public initializer {
        _initialize_ERC725(newOwner);
    }
}
