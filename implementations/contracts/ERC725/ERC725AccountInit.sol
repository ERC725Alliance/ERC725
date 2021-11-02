// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725Init.sol";
import "./ERC725AccountCore.sol";

/**
 * @title ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725AccountInit is ERC725Init, ERC725AccountCore  {

    function initialize(address _newOwner) 
        public 
        virtual 
        override(ERC725Init) 
        initializer 
    {
        ERC725Init.initialize(_newOwner);

        _registerInterface(_INTERFACE_ID_ERC725ACCOUNT);
        _registerInterface(_INTERFACE_ID_ERC1271);
        _registerInterface(_INTERFACE_ID_LSP1);
    }

}
