// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.5;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";
import {ERC725YCore} from "./ERC725YCore.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "./constants.sol";

// errors
import {OwnableCannotSetZeroAddressAsOwner} from "./errors.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract.
 *
 * @custom:warning This implementation does not have by default a `receive()` or `fallback()` function.
 */
abstract contract ERC725InitAbstract is
    Initializable,
    ERC725XCore,
    ERC725YCore
{
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

    /**
     * @inheritdoc ERC725XCore
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC725XCore, ERC725YCore) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
