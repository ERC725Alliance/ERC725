// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import "../ERC725/IERC725X.sol";
import "../ERC725/IERC725Y.sol";
import "../ERC725/ERC725Account.sol";
//import "../IERC1271.sol";
//import "../ILSP1_UniversalReceiver.sol";


contract Calculate165Selectors {

    function calculateSelectorERC725X() public pure returns (bytes4) {
        IERC725X i;

        return i.execute.selector;
    }

    function calculateSelectorERC725Y() public pure returns (bytes4) {
        IERC725Y i;

        return i.getData.selector ^ i.setData.selector;
    }

    function calculateSelectorERC725Account() public pure returns (bytes4) {
        ERC725Account i;

        return i.getData.selector
        ^ i.setData.selector
        ^ i.execute.selector
        ^ i.universalReceiver.selector
        ^ i.isValidSignature.selector;
    }

//    function calculateSelectorLSP1() public pure returns (bytes4) {
//        ILSP1 i;
//
//        return i.universalReceiver.selector;
//    }

//    function calculateSelectorERC1271() public pure returns (bytes4) {
//        IERC1271 i;
//
//        return i.isValidSignature.selector;
//    }
}
