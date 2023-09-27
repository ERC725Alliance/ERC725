// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {ERC725YInitAbstract} from "./ERC725YInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725Y, a generic data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
contract ERC725YInit is ERC725YInitAbstract {
    /**
     * @notice Deploying an ERC725YInit smart contract to be used as base contract behind proxy.
     *
     * @dev Deploy + lock base contract on deployment, so that the base implementation contract is not owned and controlled by anyone.
     * (nobody can call the public {initialize} function.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing an ERC725YInit smart contract and setting address `initialOwner` as the contract owner.
     * @dev Initialize a new ERC725YInit contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function initialize(
        address initialOwner
    ) public payable virtual initializer {
        ERC725YInitAbstract._initialize(initialOwner);
    }
}
