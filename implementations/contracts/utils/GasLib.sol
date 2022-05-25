// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev Library to add all efficient functions that could get repeated.
 */
library GasLib {
    /**
     * @dev Will return unchecked incremented uint256
     */
    function unchecked_inc(uint256 i) internal pure returns (uint256) { // solhint-disable func-name-mixedcase
        unchecked {
            return i + 1;
        }
    }
}
