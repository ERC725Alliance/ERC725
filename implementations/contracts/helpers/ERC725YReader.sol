// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "../interfaces/IERC725Y.sol";

/**
 * @dev Contract used for testing
 */
contract ERC725YReader {
    function callGetDataArray(address to, bytes32[] calldata _keys)
        public
        view
        returns (bytes[] memory)
    {
        return IERC725Y(to).getData(_keys);
    }

    function callGetDataSingle(address to, bytes32 _key) public view returns (bytes memory) {
        return IERC725Y(to).getData(_key);
    }
}
