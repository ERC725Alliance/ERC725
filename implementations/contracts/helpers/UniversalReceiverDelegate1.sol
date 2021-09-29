// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "../Interfaces/ILSP1_UniversalReceiverDelegate.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";


contract UniversalReceiverDelegate1 is ILSP1Delegate , ERC165Storage {

    bytes4 constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    constructor () {
    _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    function universalReceiverDelegate(address sender, bytes32 typeId, bytes memory data) external override returns (bytes memory){
        return "0x33ddddddddddddddd333333333333jjjjjjjjjjjjfffffff";
    }

}
