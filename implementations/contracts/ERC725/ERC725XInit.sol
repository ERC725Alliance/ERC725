// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./ERC725XCore.sol";

// modules
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title ERC725 X executor
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, as well creating contracts using `create` and `create2`.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 *
 * `execute` MUST only be called by the owner of the contract set via ERC173.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725XInit is ERC725XCore, OwnableUpgradeable {
    function initialize(address _newOwner) public virtual initializer {
        // Do not call Ownable constructor, so to prevent address(0) to be owner
        __Ownable_init_unchained();
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if (_newOwner != owner()) {
            transferOwnership(_newOwner);
        }

        _registerInterface(_INTERFACE_ID_ERC725X);
    }

    function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override onlyOwner returns(bytes memory result) {
        result = super.execute(_operation, _to, _value, _data);
    }
}
