// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {ERC725YInitAbstract} from "./ERC725YInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725Y, a generic data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network> and <CJ42>, <YamenMerhi>, <B00ste>, <SkimaHarvey>
 *
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 *
 * @custom:warning This implementation does not have by default a `receive()` or `fallback()` function to receive native tokens.
 * Despite that, its `initialize(...)` function is payable to allow the possibility to fund the contract on initialization.
 * The reason for this design is because Solidity does not allow to override a function from non payable to payable (and vice versa).
 * Therefore, the `initialize(...)` function is kept as "payable" to allow it by default. A functionality to handle receiving native
 * tokens can be added by extending the contract through inheritance.
 *
 * @custom:warning Despite that this contract can receive native tokens via the `constructor`, it does not contain any method to transfer
 * the tokens back. If you are planning to fund the contract on initialization, make sure to create or include functionalities to transfer
 * these tokens, so to prevent them from being stuck in the contract.
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
