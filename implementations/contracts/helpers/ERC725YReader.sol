// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "../interfaces/IERC725Y.sol";

/**
 * @dev Contract used for testing
 */
contract ERC725YReader {
    function callGetDataBatch(
        address to,
        bytes32[] calldata _keys
    ) public view returns (bytes[] memory) {
        return IERC725Y(to).getDataBatch(_keys);
    }

    function callGetData(
        address to,
        bytes32 _key
    ) public view returns (bytes memory) {
        return IERC725Y(to).getData(_key);
    }
}
