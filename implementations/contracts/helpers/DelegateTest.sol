// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {ERC725X} from "../ERC725X.sol";

/**
 * @dev Contract used for testing
 */
contract DelegateTest is ERC725X {
    uint256 public count;

    constructor(address owner) ERC725X(owner) {
        count = 2;
    }

    function countChange(uint256 _count) public {
        count = _count;
    }
}
