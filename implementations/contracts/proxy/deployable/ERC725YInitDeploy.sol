// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725YInit} from "../ERC725YInit.sol";

/**
 * @title Deployable Proxy Implementation of ERC725X bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725YInitDeploy is ERC725YInit {
    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner) public initializer {
        _initialize_ERC725Y(newOwner);
    }
}
