// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725XInit} from "../ERC725XInit.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725XInitDeploy is ERC725XInit {
    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner) public initializer {
        _initialize_ERC725X(newOwner);
    }
}
