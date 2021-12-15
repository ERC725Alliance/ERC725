// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "../constants.sol";

// interfaces
import "../interfaces/ILSP1UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

/**
 * @dev Contract used for testing
 */
contract UniversalReceiverDelegate1 is ILSP1UniversalReceiverDelegate, ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    // solhint-disable no-unused-vars
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) external pure override returns (bytes memory) {
        return "0x33ddddddddddddddd333333333333jjjjjjjjjjjjfffffff";
    }
}
