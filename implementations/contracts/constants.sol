// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// >> INTERFACES

// ERC173 - Contract Ownership Standard
bytes4 constant _INTERFACEID_ERC173 = 0x0e083076;

// ERC1271 - Standard Signature Validation
bytes4 constant _INTERFACEID_ERC1271 = 0x1626ba7e;

// ERC725 - Smart Contract based Account
bytes4 constant _INTERFACEID_ERC725X = 0x44c028fe;
bytes4 constant _INTERFACEID_ERC725Y = 0x5a988c0f;
bytes4 constant _INTERFACEID_ERC725ACCOUNT = 0x63cb749b;

// LSP1 - Universal Receiver
bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;
bytes4 constant _INTERFACEID_LSP1_DELEGATE = 0xc2d7bcc1;




// >> OPERATIONS
uint256 constant OPERATION_CALL = 0;
uint256 constant OPERATION_CREATE = 1;
uint256 constant OPERATION_CREATE2 = 2;
uint256 constant OPERATION_STATICCALL = 3;
uint256 constant OPERATION_DELEGATECALL = 4;

// >> OTHER

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271MAGICVALUE = 0x1626ba7e;
bytes4 constant _ERC1271FAILVALUE = 0xffffffff;

// LSP1 - Universal Receiver
bytes32 constant _UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")
