// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";
import {ERC725YCore} from "./ERC725YCore.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "./constants.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
abstract contract ERC725InitAbstract is
    Initializable,
    ERC725XCore,
    ERC725YCore
{
    function _initialize(address newOwner) internal virtual onlyInitializing {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        OwnableUnset._setOwner(newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}

    /**
     * @inheritdoc ERC165
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
