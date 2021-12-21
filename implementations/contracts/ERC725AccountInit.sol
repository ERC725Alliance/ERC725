// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725Init.sol";
import "./ERC725AccountCore.sol";

/**
 * @title Proxy Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
contract ERC725AccountInit is ERC725Init, ERC725AccountCore {
    /**
     * @notice Sets the owner of the contract and register ERC725Account, ERC1271 and LSP1UniversalReceiver interfacesId
     * @param _newOwner the owner of the contract
     */
    function initialize(address _newOwner) public virtual override(ERC725Init) onlyInitializing {
        ERC725Init.initialize(_newOwner);
        erc725Y = IERC725Y(this);

        _registerInterface(_INTERFACEID_ERC725ACCOUNT);
        _registerInterface(_INTERFACEID_ERC1271);
        _registerInterface(_INTERFACEID_LSP1);
    }
}
