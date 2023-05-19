// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {ERC725InitAbstract} from "./ERC725InitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract.
 * This implementation does not have by default a:
 *  - `receive() external payable {}`
 *  - or `fallback() external payable {}`
 */
contract ERC725Init is ERC725InitAbstract {
    /**
     * @dev Deploy + lock base contract deployment on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    function initialize(address newOwner) public payable virtual initializer {
        ERC725InitAbstract._initialize(newOwner);
    }
}
