// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725YCore} from "./ERC725YCore.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725Y, a generic data key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
abstract contract ERC725YInitAbstract is Initializable, ERC725YCore {
    /**
     * @dev Internal function to initialize the contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     * 
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function _initialize(address initialOwner) internal virtual onlyInitializing {
        require(
            initialOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        OwnableUnset._setOwner(initialOwner);
    }
}
