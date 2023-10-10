// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC725Y} from "./interfaces/IERC725Y.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OwnableUnset} from "./custom/OwnableUnset.sol";

// constants
import {_INTERFACEID_ERC725Y} from "./constants.sol";

import {
    ERC725Y_MsgValueDisallowed,
    ERC725Y_DataKeysValuesLengthMismatch,
    ERC725Y_DataKeysValuesEmptyArray
} from "./errors.sol";

/**
 * @title Core implementation of ERC725Y sub-standard, a general data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
abstract contract ERC725YCore is OwnableUnset, ERC165, IERC725Y {
    /**
     * @dev Map `bytes32` data keys to their `bytes` data values.
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
     * @custom:requirements
     * - SHOULD only be callable by the {owner}.
     *
     * @custom:warning
     * **Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value
     * (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.
     *
     * @custom:events {DataChanged} event.
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
     * @custom:requirements
     * - SHOULD only be callable by the {owner} of the contract.
     *
     * @custom:warning
     * **Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value
     * (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.
     *
     * @custom:events {DataChanged} event **for each data key/value pair set**.
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

    /**
     * @dev Read the value stored under a specific `dataKey` inside the underlying ERC725Y storage,
     *  represented as a mapping of `bytes32` data keys mapped to their `bytes` data values.
     *
     * ```solidity
     * mapping(bytes32 => bytes) _store
     * ```
     *
     * @param dataKey A bytes32 data key to read the associated `bytes` value from the store.
     * @return dataValue The `bytes` value associated with the given `dataKey` in the ERC725Y storage.
     */
    function _getData(
        bytes32 dataKey
    ) internal view virtual returns (bytes memory dataValue) {
        return _store[dataKey];
    }

    /**
     * @dev Write a `dataValue` to the underlying ERC725Y storage, represented as a mapping of
     * `bytes32` data keys mapped to their `bytes` data values.
     *
     * ```solidity
     * mapping(bytes32 => bytes) _store
     * ```
     *
     * @param dataKey A bytes32 data key to write the associated `bytes` value to the store.
     * @param dataValue The `bytes` value to associate with the given `dataKey` in the ERC725Y storage.
     *
     * @custom:events {DataChanged} event emitted after a successful `setData` call.
     */
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
