// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.5;

// modules
import {ERC725InitAbstract} from "./ERC725InitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725 bundle.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 *
 * @dev Bundles ERC725XInit and ERC725YInit together into one smart contract.
 *
 * @custom:warning This implementation does not have by default a `receive()` or `fallback()` function to receive native tokens.
 * Despite that, its `initialize(...)` function is payable to allow the possibility to fund the contract on initialization.
 * The reason for this design is because Solidity does not allow to override a function from non payable to payable (and vice versa).
 * Therefore, the `initialize(...)` function is kept as "payable" to allow it by default. Any native tokens sent to the contract on initialization
 * can be re-transferred using the {execute} or {executeBatch} functions with the `value` parameter.
 * A functionality to handle receiving native tokens can be added by extending the contract through inheritance.
 */
contract ERC725Init is ERC725InitAbstract {
    /**
     * @notice Deploying an ERC725Init smart contract to be used as base contract behind proxy.
     *
     * @dev Deploy + lock base contract on deployment, so that the base implementation contract is not owned and controlled by anyone.
     * (nobody can call the public {initialize} function.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize an ERC725Init smart contract and setting address `initialOwner` as the contract owner.
     * @dev Initialize a new ERC725Init contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function initialize(
        address initialOwner
    ) public payable virtual initializer {
        ERC725InitAbstract._initialize(initialOwner);
    }
}
