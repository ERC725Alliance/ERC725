// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @dev Contract used for testing implementing receive();
 */
contract NonPayableFallbackContract {
    // solhint-disable-next-line payable-fallback
    fallback() external {}
}
