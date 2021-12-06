// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./interfaces/IERC725Y.sol";

import "./constants.sol";
// modules
import "./utils/OwnableUnset.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

/**
 * @title ERC725 Y data store
 * @dev Contract module which provides the ability to set arbitrary key value sets that can be changed over time.
 * It is intended to standardise certain keys value pairs to allow automated retrievals and interactions
 * from interfaces and other smart contracts.
 *
 * `setData` should only be callable by the owner of the contract set via ERC173.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
abstract contract ERC725YCore is OwnableUnset, ERC165Storage, IERC725Y {
    mapping(bytes32 => bytes) internal store;

    /* Public functions */

    /**
     * @notice Gets array of data at multiple given `key`
     * @param _keys the keys which values to retrieve
     * @return values The array of data stored at multiple keys
     */
    function getData(bytes32[] memory _keys)
        public
        view
        virtual
        override
        returns (bytes[] memory values)
    {
        values = new bytes[](_keys.length);

        for (uint256 i = 0; i < _keys.length; i++) {
            values[i] = _getData(_keys[i]);
        }

        return values;
    }

    /**
     * @notice Sets array of data at multiple given `key`
     * @param _keys the keys which values to retrieve
     * @param _values the array of bytes to set.
     */
    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyOwner
    {
        require(_keys.length == _values.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < _keys.length; i++) {
            _setData(_keys[i], _values[i]);
        }
    }

    /* Internal functions */

    /**
     * @notice Gets data at a given `key`
     * @param _key the key which value to retrieve
     * @return _value The data stored at the key
     */
    function _getData(bytes32 _key) internal view virtual returns (bytes memory _value) {
        return store[_key];
    }

    /**
     * @notice Sets data at a given `key`
     * @param _key the key which value to retrieve
     * @param _value the bytes to set.
     */
    function _setData(bytes32 _key, bytes memory _value) internal virtual {
        store[_key] = _value;
        emit DataChanged(_key, _value);
    }

    /* Modifiers */
}
