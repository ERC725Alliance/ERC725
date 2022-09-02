// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev Contract used for testing implementing receive();
 */
contract PayableFallbackContract {
    fallback() external payable {}
}
