// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {
    ERC165Upgradeable
} from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC725XUpgradeable} from "./ERC725XUpgradeable.sol";
import {ERC725YUpgradeable} from "./ERC725YUpgradeable.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "./constantsUpgradeable.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
abstract contract ERC725Upgradeable is
    Initializable,
    ERC165Upgradeable,
    ERC725YUpgradeable,
    ERC725XUpgradeable
{
    function __ERC725_init(address newOwner) internal onlyInitializing {
        __ERC725X_init_unchained(newOwner);
        __ERC725Y_init_unchained(newOwner);
    }

    function __ERC725_init_unchained(address newOwner) internal onlyInitializing {}

    // NOTE this implementation has not by default: receive() external payable {}

    /**
     * @inheritdoc ERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC165Upgradeable, ERC725XUpgradeable, ERC725YUpgradeable)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
