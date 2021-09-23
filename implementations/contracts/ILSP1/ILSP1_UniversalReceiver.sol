// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

/**
 * @dev Contract module that allows to receive arbitrary messages when assets are sent or received.
 *
 * ERC 165 interface id: 0x6bb56a14
 */
interface ILSP1  /* is ERC165 */ {
    event UniversalReceiver(
        address indexed from, 
        bytes32 indexed typeId, 
        bytes indexed returnedValue,
        bytes receivedData
    );

    function universalReceiver(bytes32 typeId, bytes calldata data) external returns (bytes memory);
}