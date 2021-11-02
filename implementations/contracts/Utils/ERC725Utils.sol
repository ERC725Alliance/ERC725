// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../interfaces/IERC725Y.sol";

library ERC725Utils {
    
    function getDataSingle(IERC725Y _account, bytes32 _key) internal view returns (bytes memory) {
        bytes32[] memory keys = new bytes32[](1);
        keys[0] = _key;
        bytes memory fetchResult = _account.getData(keys)[0];
        return fetchResult;
    }

}