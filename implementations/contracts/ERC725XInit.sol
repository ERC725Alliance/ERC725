// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {ERC725XInitAbstract} from "./ERC725XInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of ERC725X, a generic executor.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725X provides the ability to call arbitrary functions on any other smart contract (including itself).
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
contract ERC725XInit is ERC725XInitAbstract {
    /**
     * @notice Deploying an ERC725XInit smart contract to be used as base contract behind proxy.
     *
     * @dev Deploy + lock base contract on deployment, so that the base implementation contract is not owned and controlled by anyone.
     * (nobody can call the public {initialize} function.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize an ERC725XInit smart contract and setting address `initialOwner` as the contract owner.
     * @dev Initialize a new ERC725XInit contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function initialize(
        address initialOwner
    ) public payable virtual initializer {
        ERC725XInitAbstract._initialize(initialOwner);
    }
}
