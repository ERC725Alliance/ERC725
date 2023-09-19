// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725YCore} from "./ERC725YCore.sol";

// errors
import {OwnableCannotSetZeroAddressAsOwner} from "./errors.sol";

/**
 * @title Deployable implementation with `constructor` of ERC725Y, a generic data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
contract ERC725Y is ERC725YCore {
    /**
     * @notice Deploying an ERC725Y smart contract and setting address `initialOwner` as the contract owner.
     * @dev Deploy a new ERC725Y contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    constructor(address initialOwner) payable {
        if (initialOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        OwnableUnset._setOwner(initialOwner);
    }
}
