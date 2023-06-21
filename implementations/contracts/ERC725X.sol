// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";

/**
 * @title ERC725 X executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
contract ERC725X is ERC725XCore {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) payable {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        OwnableUnset._setOwner(newOwner);
    }
}
