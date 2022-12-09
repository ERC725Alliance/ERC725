// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev Contract used for testing
 */
contract Counter {
    uint256 public count;

    constructor() {
        count = 0;
    }

    function increment() public {
        count = count + 1;
    }

    function incrementWithValue() public payable {
        count = count + 1;
    }

    function get() public view returns (uint256) {
        return count;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
