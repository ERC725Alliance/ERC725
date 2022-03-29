// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../ERC725Y.sol";

contract Reader {

    ERC725Y erc725y;

    constructor(ERC725Y _erc725y) {
        erc725y = _erc725y;
    }

    /**
     * @dev do not put the `view` modifier, so to display the gas usage of `getData(...)`
     *  in the gas reporter of the test suite
     */
    function read(bytes32 _key) public returns (bytes memory) {
        bytes32[] memory keys = new bytes32[](1);
        keys[0] = _key;

        bytes[] memory result = erc725y.getData(keys);
        return result[0];
    }
}