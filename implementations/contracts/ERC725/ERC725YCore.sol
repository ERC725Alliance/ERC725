// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./IERC725Y.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
abstract contract ERC725YCore is ERC165Storage, IERC725Y {
    bytes4 internal constant _INTERFACE_ID_ERC725Y = 0x5a988c0f;

    mapping(bytes32 => bytes) internal store;

    /* Public functions */

    /**
     * @notice Gets array of data for given `keys`.
     * @dev The function params are `calldata` and must be sent as transaction data. See
     * `getDataFromMemory` if keys are built during a transaction.
     * @param _keys the keys to retrieve data for.
     * @return values The array of data stored at `keys`.
     */
    function getData(bytes32[] calldata _keys)
        public
        view
        virtual
        override
        returns(bytes[] memory values)
    {
        values = new bytes[](_keys.length);

        for (uint256 i=0; i < _keys.length; i++) {
            values[i] = _getData(_keys[i]);
        }

        return values;
    }

    /**
     * @notice Gets array of data for given `keys`.
     * @dev It is not possible to allocate as `calldata`. The function params are `memory` to allow
     * using keys built during a transaction.
     * @param _keys the keys to retrieve data for.
     * @return values The array of data stored at `keys`.
     */
    function getDataFromMemory(bytes32[] memory _keys)
        public
        view
        virtual
        override
        returns(bytes[] memory values)
    {
        values = new bytes[](_keys.length);

        for (uint256 i=0; i < _keys.length; i++) {
            values[i] = _getData(_keys[i]);
        }

        return values;
    }

    /**
     * @notice Sets data for each entry in `keys` and `values`.
     * @dev The function params are `calldata` and must be sent as transaction data. See
     * `setDataFromMemory` if keys or values are built during a transaction.
     * @param _keys the array of keys to set data for.
     * @param _values the array of bytes to set at each key.
     *
     * Requirements:
     * - keys and values array length are the same
     */
    function setData(bytes32[] calldata _keys, bytes[] calldata _values)
        public
        virtual
        override
    {
        require(_keys.length == _values.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < _keys.length; i++) {
            _setData(_keys[i], _values[i]);
        }
    }

    /**
     * @notice Sets data for each entry in `keys` and `values`
     * @dev It is not possible to allocate as `calldata`. The function params are `memory` to allow
     * keys or values built during a transaction.
     * @param _keys the array of keys to set data for.
     * @param _values the array of bytes to set at each key.
     *
     * Requirements:
     * - keys and values array length are the same
     */
    function setDataFromMemory(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
    {
        require(_keys.length == _values.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < _keys.length; i++) {
            _setDataFromMemory(_keys[i], _values[i]);
        }
    }
    
    /* Internal functions */

    /**
     * @notice Gets data at a given `key`.
     * @param _key the key to retrieve data for.
     * @return _value the bytes stored at the key.
     */
    function _getData(bytes32 _key)
        internal
        view
        virtual
        returns (bytes memory _value)
    {
        return store[_key];
    }

    /**
     * @notice Sets data at a given `key`.
     * @param _key the key to set data for.
     * @param _value the bytes to set.
     */
    function _setData(bytes32 _key, bytes calldata _value)
        internal
        virtual
    {
        store[_key] = _value;
        emit DataChanged(_key, _value);
    }

    /**
     * @notice Sets data at a given `key`.
     * @dev When an inheriting contract builds a value, it will never be a `bytes calldata`,
     * so we provide this function to easily set the key and emit the expected event.
     * @param _key the key which value to retrieve.
     * @param _value the bytes to set.
     */
    function _setDataFromMemory(bytes32 _key, bytes memory _value)
        internal
        virtual
    {
        store[_key] = _value;
        emit DataChanged(_key, _value);
    }

    /* Modifiers */
}
