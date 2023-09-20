// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";

// errors
import {OwnableCannotSetZeroAddressAsOwner} from "./errors.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725X, a generic executor.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725X provides the ability to call arbitrary functions on any other smart contract (including itself).
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
abstract contract ERC725XInitAbstract is Initializable, ERC725XCore {
    /**
     * @dev Internal function to initialize the contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function _initialize(
        address initialOwner
    ) internal virtual onlyInitializing {
        if (initialOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        OwnableUnset._setOwner(initialOwner);
    }
}
