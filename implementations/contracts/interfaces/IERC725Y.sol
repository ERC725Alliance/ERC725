// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title The interface for ERC725Y General data key/value store
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time
 * It is intended to standardise certain data key/value pairs to allow automated read and writes
 * from/to the contract storage
 */
interface IERC725Y is IERC165 {
    /**
     * @notice Emitted when data at a key is changed
     * @param dataKey The data key which data value is set
     * @param dataValue The data value to set
     */
    event DataChanged(bytes32 indexed dataKey, bytes dataValue);

    /**
     * @notice Gets singular data at a given `dataKey`
     * @param dataKey The key which value to retrieve
     * @return dataValue The data stored at the key
     */
    function getData(
        bytes32 dataKey
    ) external view returns (bytes memory dataValue);

    /**
     * @notice Gets array of data for multiple given keys
     * @param dataKeys The array of keys which values to retrieve
     * @return dataValues The array of data stored at multiple keys
     */
    function getDataBatch(
        bytes32[] memory dataKeys
    ) external view returns (bytes[] memory dataValues);

    /**
     * @notice Sets singular data for a given `dataKey`
     * @param dataKey The key to retrieve stored value
     * @param dataValue The value to set
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * The function is marked as payable to enable flexibility on child contracts
     *
     * If the function is not intended to receive value, an additional check
     * should be implemented to check that value equal 0.
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) external payable;

    /**
     * @param dataKeys The array of data keys for values to set
     * @param dataValues The array of values to set
     * @dev Sets array of data for multiple given `dataKeys`
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * The function is marked as payable to enable flexibility on child contracts
     *
     * If the function is not intended to receive value, an additional check
     * should be implemented to check that value equal 0.
     *
     * Emits a {DataChanged} event.
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) external payable;
}
