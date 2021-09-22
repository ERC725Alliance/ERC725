// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../ILSP1/ILSP1_UniversalReceiver.sol";

contract BasicUniversalReceiver is ILSP1 {

    bytes32 constant internal _TOKENS_SENDER_INTERFACE_HASH =
    0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")

    bytes32 constant internal _TOKENS_RECIPIENT_INTERFACE_HASH =
    0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b; // keccak256("ERC777TokensRecipient")

    function universalReceiver(bytes32 typeId, bytes memory data) external override returns (bytes memory returnValue){
        require(typeId == _TOKENS_RECIPIENT_INTERFACE_HASH || typeId == _TOKENS_SENDER_INTERFACE_HASH);

        emit UniversalReceiver(msg.sender, typeId, abi.encodePacked(typeId), data);

        return abi.encodePacked(typeId);
    }
}