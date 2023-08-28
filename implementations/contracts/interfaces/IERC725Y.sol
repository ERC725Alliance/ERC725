// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title The interface for ERC725Y sub-standard, a generic data key/value store.
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
interface IERC725Y is IERC165 {
    /**
     * @notice The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.
     * @dev Emitted when data at a specific `dataKey` was changed to a new value `dataValue`.
     * @param dataKey The data key for which a bytes value is set.
     * @param dataValue The value to set for the given data key.
     */
    event DataChanged(bytes32 indexed dataKey, bytes dataValue);

    /**
     * @notice Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.
     * @dev Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.
     * @param dataKey The data key for which to retrieve the value.
     * @return dataValue The bytes value stored under the specified data key.
     */
    function getData(
        bytes32 dataKey
    ) external view returns (bytes memory dataValue);

    /**
     * @notice Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.
     * @dev Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.
     * @param dataKeys The array of keys which values to retrieve
     * @return dataValues The array of data stored at multiple keys
     */
    function getDataBatch(
        bytes32[] memory dataKeys
    ) external view returns (bytes[] memory dataValues);

    /**
     * @notice Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.
     *
     * @dev Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`.
     * The function is marked as payable to enable flexibility on child contracts. For instance to implement
     * a fee mechanism for setting specific data.
     *
     * @param dataKey The data key for which to set a new value.
     * @param dataValue The new bytes value to set.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) external payable;

    /**
     * @notice Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.
     *
     * @dev Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.
     *
     * @param dataKeys An array of data keys to set bytes values for.
     * @param dataValues An array of bytes values to set for each `dataKeys`.
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) external payable;
}
