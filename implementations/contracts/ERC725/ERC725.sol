// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// modules
import "./ERC725X.sol";
import "./ERC725Y.sol";

/**
 * @title ERC725 bundle
 * @dev Bundles ERC725X and ERC725Y together into one smart contract
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */
contract ERC725 is ERC725X, ERC725Y  {

    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner)
    ERC725X(_newOwner)
    ERC725Y(_newOwner)
    public {}

    // NOTE this implementation has not by default: receive() external payable {}
}
