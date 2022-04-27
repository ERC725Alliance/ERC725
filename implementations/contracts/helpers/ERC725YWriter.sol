// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "../interfaces/IERC725Y.sol";

/**
 * @dev Contract used for testing
 */
contract ERC725YWriter {
    function callSetData(
        address to,
        bytes32[] calldata _keys,
        bytes[] calldata _values
    ) public {
        IERC725Y(to).setData(_keys, _values);
    }

    function setDataComputed(address to) public {
        // create the keys
        bytes32[] memory _keys = new bytes32[](1);
        _keys[0] = keccak256(abi.encodePacked("MyName"));
        // create the values
        bytes[] memory _values = new bytes[](1);
        _values[0] = abi.encodePacked("LUKSO");
        IERC725Y(to).setData(_keys, _values);
    }
}
