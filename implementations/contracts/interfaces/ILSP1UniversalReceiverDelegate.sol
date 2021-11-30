// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

/**
 * @dev Contract module that allows for an external universal receiver smart contract,
 *      that is the delegate of the initial universal receiver
 */
/* is ERC165 */
interface ILSP1UniversalReceiverDelegate {
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) external returns (bytes memory);
}
