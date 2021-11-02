// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../interfaces/IERC725Y.sol";

contract ERC725YReader {

    function CallGetData(address to, bytes32[] calldata _keys)
        public
        view
        returns(bytes[] memory)
    {
        return IERC725Y(to).getData(_keys);
    }

}