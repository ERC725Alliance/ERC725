// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271MAGICVALUE = 0x1626ba7e;
bytes4 constant _ERC1271FAILVALUE = 0xffffffff;

// LSP1 - Universal Receiver
bytes32 constant _UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")
