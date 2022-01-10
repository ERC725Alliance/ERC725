// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./ERC725InitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract
 */
contract ERC725Init is ERC725InitAbstract {
    /**
     * @inheritdoc ERC725InitAbstract
     */
    function initialize(address _newOwner) public virtual override initializer {
        ERC725InitAbstract.initialize(_newOwner);
    }

    // NOTE this implementation has not by default: receive() external payable {}
}
