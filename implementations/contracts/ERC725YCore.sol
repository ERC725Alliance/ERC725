// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "./interfaces/IERC725Y.sol";

// libraries
import {GasLib} from "./utils/GasLib.sol";

// modules
import {OwnableUnset} from "./utils/OwnableUnset.sol";

/**
 * @title Core implementation of ERC725 Y General key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Contract module which provides the ability to set arbitrary key value sets that can be changed over time
 * It is intended to standardise certain keys value pairs to allow automated retrievals and interactions
 * from interfaces and other smart contracts
 */
abstract contract ERC725YCore is IERC725Y, OwnableUnset {
    /**
     * @dev Map the keys to their values
     */
    mapping(bytes32 => bytes) internal store;

    /* Public functions */
    /**
     * @inheritdoc IERC725Y
     */
    function getData(bytes32 key) public view virtual override returns (bytes memory value) {
        value = _getData(key);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function setData(bytes32 key, bytes memory value) public virtual override onlyOwner {
        _setData(key, value);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function getData(bytes32[] memory keys)
        public
        view
        virtual
        override
        returns (bytes[] memory values)
    {
        values = new bytes[](keys.length);

        for (uint256 i = 0; i < keys.length; i = GasLib.unchecked_inc(i)) {
            values[i] = _getData(keys[i]);
        }

        return values;
    }

    /**
     * @inheritdoc IERC725Y
     */
    function setData(bytes32[] memory keys, bytes[] memory values)
        public
        virtual
        override
        onlyOwner
    {
        require(keys.length == values.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < keys.length; i = GasLib.unchecked_inc(i)) {
            _setData(keys[i], values[i]);
        }
    }

    /* Internal functions */

    function _getData(bytes32 key) internal view virtual returns (bytes memory value) {
        return store[key];
    }

    function _setData(bytes32 key, bytes memory value) internal virtual {
        store[key] = value;
        emit DataChanged(key, value);
    }
}
