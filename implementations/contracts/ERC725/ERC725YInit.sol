// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./ERC725YCore.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

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
contract ERC725YInit is ERC725YCore, Initializable {
    function initialize(address _newOwner) public virtual initializer {
        // Do not call Ownable constructor, so to prevent address(0) to be owner
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        
        if (_newOwner != owner()) {
            OwnableUnset.initOwner(_newOwner);
        }

        _registerInterface(_INTERFACE_ID_ERC725Y);
    }

    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyOwner
    {
        super.setData(_keys, _values);
    }
}
