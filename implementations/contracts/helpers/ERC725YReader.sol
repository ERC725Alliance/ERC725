// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../ERC725/IERC725Y.sol";

contract ERC725YReader {

    function CallGetData(address to, bytes32[] calldata _keys)
        public
        view
        returns(bytes[] memory)
    {
        return IERC725Y(to).getData(_keys);
    }

    function CallGetDataFromMemory(address to, uint256 amountOfKeys)
        public
        view
        returns(bytes[] memory)
    {
        bytes32[] memory keys = new bytes32[](amountOfKeys);

        for (uint256 i=0; i < amountOfKeys; i++) {
            keys[i] = abi.decode(abi.encodePacked("key", uint232(i)), (bytes32));
        }

        return IERC725Y(to).getDataFromMemory(keys);
    }

}
