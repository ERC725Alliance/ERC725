// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../ERC725X.sol";

/**
 * @title ERC725XPayableTester
 * @dev ERC725X and ERC725 do not include a receive() or fallback() function by default
 *  this contract is used so that:
 *      1. the contract can first receive native tokens
 *      2. the contract can then transfer the native tokens in its balance via ERC725X.execute(0, recipient, amount, "")
 */
contract ERC725XPayableTester is ERC725X {
    // solhint-disable-next-line no-empty-blocks
    constructor(address _newOwner) ERC725X(_newOwner) {}

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
