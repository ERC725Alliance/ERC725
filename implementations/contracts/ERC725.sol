// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC725X} from "./ERC725X.sol";
import {ERC725Y} from "./ERC725Y.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "./constants.sol";

/**
 * @title ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725X and ERC725Y together into one smart contract
 */
contract ERC725 is ERC165, ERC725X, ERC725Y {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) ERC725X(newOwner) ERC725Y(newOwner) {}

    // NOTE this implementation has not by default: receive() external payable {}

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, ERC725X, ERC725Y) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
