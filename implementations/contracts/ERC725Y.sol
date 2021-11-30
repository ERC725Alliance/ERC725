// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
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
contract ERC725Y is ERC725YCore {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) {
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if (_newOwner != owner()) {
            OwnableUnset.initOwner(_newOwner);
        }

        _registerInterface(_INTERFACEID_ERC725Y);
    }
}
