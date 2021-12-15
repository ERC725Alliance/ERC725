// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

/**
 * @title The interface for LSP1UniversalReceiverDelegate
 * @dev LSP1UniversalReceiverDelegate allows for an external universal receiver smart contract,
 * that is the delegate of the initial universal receiver
 */
interface ILSP1UniversalReceiverDelegate {
    /**
     * @dev Get called by the universalReceiver function, can be customized to have a specific logic
     * @param sender The address calling the universalReceiver function
     * @param typeId The hash of a specific standard or a hook
     * @param data The arbitrary data received with the call
     * @return result Any useful data could be returned
     */
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) external returns (bytes memory result);
}
