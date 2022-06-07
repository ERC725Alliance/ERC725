// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title Error Handler
 * @dev When calling other contracts via low-level calls like `contract.call{ ... }(data)`, errors
 * need to be handled manually. This library will correctly handle the built-in Error(string) and
 * Panic(uint256) as well as custom errors introduced in Solidity 0.8.4.
 */
library ErrorHandlerLib {
    /**
     * @dev Will revert with the provided error payload.
     */
    function revertWithParsedError(bytes memory error)
        internal
        pure
    {
        if (error.length > 0) {
            // the call reverted with a error string or a custom error
            // solhint-disable no-inline-assembly
            assembly {
                let error_size := mload(error)
                revert(add(32, error), error_size)
            }
        } else {
            // there was no error payload, revert with empty payload
            // solhint-disable reason-string
            revert();
        }
    }
}
