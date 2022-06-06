// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "./custom/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725YCore} from "./ERC725YCore.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 Y General key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Contract module which provides the ability to set arbitrary dataKey/dataValue sets that can be changed over time
 * It is intended to standardise certain dataKeys dataValue pairs to allow automated retrievals and interactions
 * from interfaces and other smart contracts
 */
abstract contract ERC725YInitAbstract is Initializable, ERC725YCore {
    function _initialize(address newOwner) internal virtual onlyInitializing {
        OwnableUnset._setOwner(newOwner);
    }
}
