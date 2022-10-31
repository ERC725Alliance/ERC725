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
            EXECUTE_SELECTOR == bytes4(keccak256("execute(uint256,address,uint256,bytes)")),
            "hardcoded EXECUTE_SELECTOR in `constants.sol` does not match `IERC725X.execute.selector`"
        );
        return bytes4(keccak256("execute(uint256,address,uint256,bytes)"));
    }

    function getExecuteArraySelector() public pure returns (bytes4) {
        require(
            EXECUTE_ARRAY_SELECTOR ==
                bytes4(keccak256("execute(uint256[],address[],uint256[],bytes[])")),
            "hardcoded EXECUTE_ARRAY_SELECTOR in `constants.sol` does not match `IERC725X.execute.selector`"
        );
        return bytes4(keccak256("execute(uint256[],address[],uint256[],bytes[])"));
    }

    function getSetDataSelector() public pure returns (bytes4) {
        require(
            SETDATA_SELECTOR == bytes4(keccak256("setData(bytes32,bytes)")),
            "hardcoded SETDATA_SELECTOR in `constants.sol` does not match `IERC725Y.setData.selector`"
        );
        return bytes4(keccak256("setData(bytes32,bytes)"));
    }

    function getSetDataArraySelector() public pure returns (bytes4) {
        require(
            SETDATA_ARRAY_SELECTOR == bytes4(keccak256("setData(bytes32[],bytes[])")),
            "hardcoded SETDATA_ARRAY_SELECTOR in `constants.sol` does not match `IERC725Y.setData.selector`"
        );
        return bytes4(keccak256("setData(bytes32[],bytes[])"));
    }
}
