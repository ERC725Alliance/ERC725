// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract Counter {
    uint public count;

    constructor () {
        count = 0;
    }

    function increment() public {
        count = count + 1;
    }

    function get() public view returns (uint256) {
        return count;
    }

    // solhint-disable no-empty-blocks
    receive() external payable {}
}
