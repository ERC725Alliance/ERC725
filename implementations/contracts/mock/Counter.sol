// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.1;

contract Counter {
    uint count;

    constructor () public {
        count = 0;
    }

    function increment() public {
        count = count + 1;
    }

    function get() public view returns (uint256) {
        return count;
    }

    receive() external payable {}
}
