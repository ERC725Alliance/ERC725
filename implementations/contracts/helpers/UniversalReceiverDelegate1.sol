// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// interfaces
import "../interfaces/ILSP1_UniversalReceiverDelegate.sol";


contract UniversalReceiverDelegate1 is ILSP1Delegate , ERC165Storage {

    bytes4 internal constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    constructor () {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    // solhint-disable no-unused-vars
    function universalReceiverDelegate(address sender, bytes32 typeId, bytes memory data) external pure override returns (bytes memory){
        return "0x33ddddddddddddddd333333333333jjjjjjjjjjjjfffffff";
    }

}
