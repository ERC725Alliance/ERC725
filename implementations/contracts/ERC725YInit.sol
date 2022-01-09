// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725YInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 Y General key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Contract module which provides the ability to set arbitrary key value sets that can be changed over time
 * It is intended to standardise certain keys value pairs to allow automated retrievals and interactions
 * from interfaces and other smart contracts
 */
contract ERC725YInit is ERC725YInitAbstract {
    /**
     * @inheritdoc ERC725YInitAbstract
     */
    function initialize(address _newOwner) public virtual override initializer {
        ERC725YInitAbstract.initialize(_newOwner);
    }
}
