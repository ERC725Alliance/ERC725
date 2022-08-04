// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "../interfaces/IERC725Y.sol";

/**
 * @dev Contract used for testing
 */
contract ERC725YWriter {
    function callSetDataArray(
        address to,
        bytes32[] calldata _keys,
        bytes[] calldata _values
    ) public {
        IERC725Y(to).setData(_keys, _values);
    }

    function callSetDataSingle(
        address to,
        bytes32 _key,
        bytes calldata _value
    ) public {
        IERC725Y(to).setData(_key, _value);
    }
}
