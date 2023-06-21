// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC725Y} from "./interfaces/IERC725Y.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";

// constants
import {_INTERFACEID_ERC725Y} from "./constants.sol";

import "./errors.sol";

/**
 * @title Core implementation of ERC725Y General data key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Contract module which provides the ability to set arbitrary data key/value pairs that can be changed over time
 * It is intended to standardise certain data key/value pairs to allow automated read and writes
 * from/to the contract storage
 */
abstract contract ERC725YCore is OwnableUnset, ERC165, IERC725Y {
    /**
     * @dev Map the dataKeys to their dataValues
     */
    mapping(bytes32 => bytes) internal _store;

    /**
     * @inheritdoc IERC725Y
     */
    function getData(
        bytes32 dataKey
    ) public view virtual override returns (bytes memory dataValue) {
        dataValue = _getData(dataKey);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function getDataBatch(
        bytes32[] memory dataKeys
    ) public view virtual override returns (bytes[] memory dataValues) {
        dataValues = new bytes[](dataKeys.length);

        for (uint256 i = 0; i < dataKeys.length; ) {
            dataValues[i] = _getData(dataKeys[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }

        return dataValues;
    }

    /**
     * @inheritdoc IERC725Y
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override onlyOwner {
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();
        _setData(dataKey, dataValue);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override onlyOwner {
        /// @dev do not allow to send value by default when setting data in ERC725Y
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();

        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        if (dataKeys.length == 0) {
            revert ERC725Y_DataKeysValuesEmptyArray();
        }

        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }
    }

    function _getData(
        bytes32 dataKey
    ) internal view virtual returns (bytes memory dataValue) {
        return _store[dataKey];
    }

    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual {
        _store[dataKey] = dataValue;
        emit DataChanged(dataKey, dataValue);
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC165) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}
