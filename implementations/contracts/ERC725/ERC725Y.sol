// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC725YCore.sol";

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
contract ERC725Y is Ownable, ERC725YCore {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) {
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if (_newOwner != owner()) {
            transferOwnership(_newOwner);
        }

        _registerInterface(_INTERFACE_ID_ERC725Y);
    }

    /**
     * @notice Sets data for each entry in `keys` and `values`.
     * @dev The function params are `calldata` and must be sent as transaction data. See
     * `setDataFromMemory` if keys or values are built during a transaction.
     * @param _keys the array of keys to set data for.
     * @param _values the array of bytes to set at each key.
     *
     * Requirements:
     * - caller is owner
     * - keys and values array length are the same
     */
    function setData(bytes32[] calldata _keys, bytes[] calldata _values)
        public
        virtual
        override
        onlyOwner
    {
        super.setData(_keys, _values);
    }

    /**
     * @notice Sets data for each entry in `keys` and `values`
     * @dev It is not possible to allocate as `calldata`. The function params are `memory` to allow
     * keys or values built during a transaction.
     * @param _keys the array of keys to set data for.
     * @param _values the array of bytes to set at each key.
     *
     * Requirements:
     * - caller is owner
     * - keys and values array length are the same
     */
    function setDataFromMemory(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyOwner
    {
        super.setDataFromMemory(_keys, _values);
    }
}
