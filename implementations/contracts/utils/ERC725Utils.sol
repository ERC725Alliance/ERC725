// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../interfaces/IERC725Y.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

/**
 * @title ERC725Utils
 * @author Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Utils library to be used when dealing with contracts related to ERC725
 */
library ERC725Utils {
    // internal functions

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
     * @dev Initiates Map and ArrayKey and sets the length of the Array to `1` if it's not set before,
     * If it's already set, it decodes the arrayLength, increment it and adds Map and ArrayKey
     */
    function addMapAndArrayKey(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes32 _mapKey,
        address _sender,
        bytes4 _appendix
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        bytes memory rawArrayLength = getDataSingle(_account, _arrayKey);

        keys[0] = _arrayKey;
        keys[2] = _mapKey;

        values[1] = abi.encodePacked(_sender);

        if (rawArrayLength.length != 32) {
            keys[1] = _generateArrayKeyAtIndex(_arrayKey, 0);

            values[0] = abi.encodePacked(uint256(1));
            values[2] = abi.encodePacked(bytes8(0), _appendix);
        } else if (rawArrayLength.length == 32) {
            uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
            uint256 newArrayLength = arrayLength + 1;

            keys[1] = _generateArrayKeyAtIndex(_arrayKey, newArrayLength - 1);

            values[0] = abi.encodePacked(newArrayLength);
            values[2] = abi.encodePacked(bytes8(uint64(arrayLength)), _appendix);
        }
    }

    /**
     * @dev Decrements the arrayLength, removes the Map, swaps the arrayKey that need to be removed with
     * the last `arrayKey` in the array and removes the last arrayKey with updating all modified entries
     */
    function removeMapAndArrayKey(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes32 mapHash,
        bytes32 _mapKeyToRemove
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](5);
        values = new bytes[](5);

        uint64 index = _extractIndexFromMap(_account, _mapKeyToRemove);
        bytes32 arrayKeyToRemove = _generateArrayKeyAtIndex(_arrayKey, index);

        bytes memory rawArrayLength = getDataSingle(_account, _arrayKey);
        uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
        uint256 newLength = arrayLength - 1;

        keys[0] = _arrayKey;
        values[0] = abi.encodePacked(newLength);

        keys[1] = _mapKeyToRemove;
        values[1] = "";

        if (index == (arrayLength - 1)) {
            keys[2] = arrayKeyToRemove;
            values[2] = "";
        } else {
            bytes32 lastKey = _generateArrayKeyAtIndex(_arrayKey, newLength);
            bytes memory lastKeyValue = getDataSingle(_account, lastKey);

            bytes32 mapOfLastkey = generateMapKey(mapHash, lastKeyValue);
            bytes memory mapValueOfLastkey = getDataSingle(_account, mapOfLastkey);

            bytes memory appendix = BytesLib.slice(mapValueOfLastkey, 8, 4);

            keys[2] = arrayKeyToRemove;
            values[2] = lastKeyValue;

            keys[3] = lastKey;
            values[3] = "";

            keys[4] = mapOfLastkey;
            values[4] = abi.encodePacked(bytes8(index), appendix);
        }
    }

    function generateMapKey(bytes32 _mapHash, bytes memory _sender)
        internal
        pure
        returns (bytes32)
    {
        bytes memory mapKey = abi.encodePacked(bytes8(_mapHash), bytes4(0), _sender);
        return _generateBytes32Key(mapKey);
    }

    // private functions

    function _generateBytes32Key(bytes memory _rawKey) private pure returns (bytes32 key) {
        /* solhint-disable */
        assembly {
            key := mload(add(_rawKey, 32))
        }
        /* solhint-enable */
    }

    function _generateArrayKeyAtIndex(bytes32 _arrayKey, uint256 _index)
        private
        pure
        returns (bytes32)
    {
        bytes memory elementInArray = abi.encodePacked(
            bytes16(_arrayKey),
            bytes16(uint128(_index))
        );
        return _generateBytes32Key(elementInArray);
    }

    function _extractIndexFromMap(IERC725Y _account, bytes32 _mapKey)
        private
        view
        returns (uint64)
    {
        bytes memory indexInBytes = getDataSingle(_account, _mapKey);
        bytes8 indexKey;
        /* solhint-disable */
        assembly {
            indexKey := mload(add(indexInBytes, 32))
        }
        /* solhint-enable */
        return uint64(indexKey);
    }
}
