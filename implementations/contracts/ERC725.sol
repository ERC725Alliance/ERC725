// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.5;

// modules
import {ERC725X} from "./ERC725X.sol";
import {ERC725Y} from "./ERC725Y.sol";

/**
 * @title ERC725 bundle.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 *
 * @dev Bundle ERC725X and ERC725Y together into one smart contract.
 *
 * @custom:warning This implementation does not have by default a `receive()` or `fallback()` function to receive native tokens.
 * Despite that, its constructor is payable to allow the possibility to fund the contract on deployment.
 * The reason for this design is because Solidity does not allow to override a function from non payable to payable (and vice versa).
 * Therefore, the constructor is kept as "payable" to allow it by default. Any native tokens sent to the contract on deployment can
 * be re-transferred using the {execute} or {executeBatch} functions with the `value` parameter.
 * A functionality to handle receiving native tokens can be added by extending the contract through inheritance.
 */
contract ERC725 is ERC725X, ERC725Y {
    /**
     * @notice Deploying an ERC725 smart contract and setting address `initialOwner` as the contract owner.
     * @dev Deploy a new ERC725 contract with the provided `initialOwner` as the contract {owner}, and optionally fund the contract on deployment.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    constructor(
        address initialOwner
    ) payable ERC725X(initialOwner) ERC725Y(initialOwner) {}

    /**
     * @inheritdoc ERC725X
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC725X, ERC725Y) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
