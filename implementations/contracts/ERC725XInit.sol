// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725XInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 X Executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
contract ERC725XInit is ERC725XInitAbstract {
    /**
     * @inheritdoc ERC725XInitAbstract
     */
    function initialize(address _newOwner) public virtual override initializer {
        ERC725XInitAbstract.initialize(_newOwner);
    }
}
