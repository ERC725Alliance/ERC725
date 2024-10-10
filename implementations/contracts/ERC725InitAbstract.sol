// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.5;

// modules
import {ERC725XInitAbstract} from "./ERC725XInitAbstract.sol";
import {ERC725YInitAbstract} from "./ERC725YInitAbstract.sol";

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
    ERC725XInitAbstract,
    ERC725YInitAbstract
{
    /**
     * @dev Internal function to initialize the contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * NOTE: we can safely override this function and not call the parent `_initialize(...)` functions from `ERC725XInitAbstract` and `ERC725YInitAbstract`
     * as the code logic from this `_initialize(...)` is the exactly the same.
     *
     * @custom:warning If a child contract that inherits `ERC725InitAbstract` needs to override the logic of the `_initialize` function, make sure it calls
     * also this function inside this logic via `super._initialize(initialOwner)` or `ERC725InitAbstract._initialize(initialOwner)`.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function _initialize(
        address initialOwner
    )
        internal
        virtual
        override(ERC725XInitAbstract, ERC725YInitAbstract)
        onlyInitializing
    {
        if (initialOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @inheritdoc ERC725XInitAbstract
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC725XInitAbstract, ERC725YInitAbstract)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
