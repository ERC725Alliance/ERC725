// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";

// errors
import {OwnableCannotSetZeroAddressAsOwner} from "./errors.sol";

/**
 * @title Deployable implementation with `constructor` of ERC725X, a generic executor.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725X provides the ability to call arbitrary functions on any other smart contract (including itself).
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
contract ERC725X is ERC725XCore {
    /**
     * @notice Deploying an ERC725X smart contract and setting address `initialOwner` as the contract owner.
     * @dev Deploy a new ERC725X contract with the provided `initialOwner` as the contract {owner}.
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
