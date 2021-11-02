// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "../interfaces/ILSP1_UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import "../InterfaceIDs.sol";

contract UniversalReceiverDelegate1 is ILSP1Delegate , ERC165Storage {

    constructor () {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    // solhint-disable no-unused-vars
    function universalReceiverDelegate(address sender, bytes32 typeId, bytes memory data) external pure override returns (bytes memory){
        return "0x33ddddddddddddddd333333333333jjjjjjjjjjjjfffffff";
    }

}
