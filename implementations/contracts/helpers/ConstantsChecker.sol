// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725X} from "../interfaces/IERC725X.sol";
import {IERC725Y} from "../interfaces/IERC725Y.sol";

// constants
import "../constants.sol";

/**
 * @dev Contract used to calculate constants
 */
contract ConstantsChecker {
    function getERC725XInterfaceID() public pure returns (bytes4) {
        require(
            _INTERFACEID_ERC725X == type(IERC725X).interfaceId,
            "hardcoded _INTERFACEID_ERC725X in `constants.sol` does not match `type(IERC725X).interfaceId`"
        );
        return type(IERC725X).interfaceId;
    }

    function getERC725YInterfaceID() public pure returns (bytes4) {
        require(
            _INTERFACEID_ERC725Y == type(IERC725Y).interfaceId,
            "hardcoded _INTERFACEID_ERC725Y in `constants.sol` does not match `type(IERC725Y).interfaceId`"
        );
        return type(IERC725Y).interfaceId;
    }

    function getExecuteSelector() public pure returns (bytes4) {
        require(
            EXECUTE_SELECTOR == IERC725X.execute.selector,
            "hardcoded EXECUTE_SELECTOR in `constants.sol` does not match `IERC725X.execute.selector`"
        );
        return IERC725X.execute.selector;
    }

    function getExecuteArraySelector() public pure returns (bytes4) {
        require(
            EXECUTE_BATCH_SELECTOR == IERC725X.executeBatch.selector,
            "hardcoded EXECUTE_BATCH_SELECTOR in `constants.sol` does not match `IERC725X.execute.selector`"
        );
        return IERC725X.executeBatch.selector;
    }

    function getSetDataSelector() public pure returns (bytes4) {
        require(
            SETDATA_SELECTOR == IERC725Y.setData.selector,
            "hardcoded SETDATA_SELECTOR in `constants.sol` does not match `IERC725Y.setData.selector`"
        );
        return IERC725Y.setData.selector;
    }

    function getSetDataArraySelector() public pure returns (bytes4) {
        require(
            SETDATA_BATCH_SELECTOR == IERC725Y.setDataBatch.selector,
            "hardcoded SETDATA_BATCH_SELECTOR in `constants.sol` does not match `IERC725Y.setData.selector`"
        );
        return IERC725Y.setDataBatch.selector;
    }
}
