// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../interfaces/IERC725Y.sol";

library ERC725Utils {
    /**
     * @dev Gets one value from account storage
     */
    function getDataSingle(IERC725Y _account, bytes32 _key) internal view returns (bytes memory) {
        bytes32[] memory keys = new bytes32[](1);
        keys[0] = _key;
        bytes memory fetchResult = _account.getData(keys)[0];
        return fetchResult;
    }

    /**
     * @dev Sets one key/value pair in the account storage
     */
    function setDataSingle(
        IERC725Y _account,
        bytes32 _key,
        bytes memory _value
    ) internal {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = _key;
        values[0] = _value;

        _account.setData(keys, values);
    }
}
