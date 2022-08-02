// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract NormalContract {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }
}
