// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../ERC725/IERC725Y.sol";

contract ERC725YWriter {

    function CallSetData(address to, bytes32[] calldata _keys, bytes[] calldata _values)
        public
    {
        IERC725Y(to).setData(_keys, _values);
    }

    function CallSetDataFromMemory(address to, uint256 amountOfEntries)
        public
    {
        bytes32[] memory keys = new bytes32[](amountOfEntries);
        bytes[] memory values = new bytes[](amountOfEntries);

        for (uint256 i=0; i < amountOfEntries; i++) {
            keys[i] = abi.decode(abi.encodePacked("key", uint232(i)), (bytes32));
            values[i] = abi.encodePacked("value", uint8(i));
        }

        IERC725Y(to).setDataFromMemory(keys, values);
    }
}
