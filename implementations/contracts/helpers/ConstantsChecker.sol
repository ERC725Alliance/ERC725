// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725X} from "../interfaces/IERC725X.sol";
import {IERC725Y} from "../interfaces/IERC725Y.sol";

// constants
import {_INTERFACEID_ERC725X, _INTERFACEID_ERC725Y} from "../constants.sol";

/**
 * @dev Contract used to calculate constants
 */
contract ConstantsChecker {
    function getERC725XInterfaceID() public pure returns (bytes4) {
        // solhint-disable-next-line gas-custom-errors
        require(
            _INTERFACEID_ERC725X == type(IERC725X).interfaceId,
            "hardcoded _INTERFACEID_ERC725X in `constants.sol` does not match `type(IERC725X).interfaceId`"
        );
        return type(IERC725X).interfaceId;
    }

    function getERC725YInterfaceID() public pure returns (bytes4) {
        // solhint-disable-next-line gas-custom-errors
        require(
            _INTERFACEID_ERC725Y == type(IERC725Y).interfaceId,
            "hardcoded _INTERFACEID_ERC725Y in `constants.sol` does not match `type(IERC725Y).interfaceId`"
        );
        return type(IERC725Y).interfaceId;
    }
}
