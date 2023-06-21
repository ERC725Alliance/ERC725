// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";
import {ERC725XCore} from "./ERC725XCore.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 X Executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XInitAbstract is Initializable, ERC725XCore {
    function _initialize(address newOwner) internal virtual onlyInitializing {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        OwnableUnset._setOwner(newOwner);
    }
}
