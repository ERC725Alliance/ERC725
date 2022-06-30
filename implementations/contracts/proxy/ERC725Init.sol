// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {Initializable} from "../custom/Initializable.sol";
import {OwnableUnset} from "../custom/OwnableUnset.sol";
import {ERC725XInit} from "./ERC725XInit.sol";
import {ERC725YInit} from "./ERC725YInit.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "../constants.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
abstract contract ERC725Init is Initializable, ERC725XInit, ERC725YInit {
    function _initialize_ERC725(address newOwner) internal virtual onlyInitializing {
        _initialize_ERC725X(newOwner);
        _initialize_ERC725Y(newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}

    /* Overrides functions */

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725XInit, ERC725YInit)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
