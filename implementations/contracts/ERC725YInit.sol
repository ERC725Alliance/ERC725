// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {ERC725YInitAbstract} from "./ERC725YInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725Y General data key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Contract module which provides the ability to set arbitrary data key/value pairs that can be changed over time
 * It is intended to standardise certain data key/value pairs to allow automated read and writes
 * from/to the contract storage
 */
contract ERC725YInit is ERC725YInitAbstract {
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
    function initialize(address newOwner) public payable virtual initializer {
        ERC725YInitAbstract._initialize(newOwner);
    }
}
