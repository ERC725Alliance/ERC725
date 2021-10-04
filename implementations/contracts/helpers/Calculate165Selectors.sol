// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import "../ERC725/IERC725X.sol";
import "../ERC725/IERC725Y.sol";
import "../ERC725/ERC725Account.sol";

contract Calculate165Selectors {

    function calculateSelectorERC725X() public pure returns (bytes4) {
        return type(IERC725X).interfaceId;
    }

    function calculateSelectorERC725Y() public pure returns (bytes4) {
        return type(IERC725Y).interfaceId;
    }

    function calculateSelectorERC725Account() public pure returns (bytes4) {
        ERC725Account i;

    // Owner and transferOwnership are left for purpose
        return i.getData.selector
        ^ i.setData.selector
        ^ i.execute.selector
        ^ i.universalReceiver.selector
        ^ i.isValidSignature.selector;
    }
}
