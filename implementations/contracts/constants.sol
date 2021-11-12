// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./interfaces/IERC725X.sol";
import "./interfaces/IERC725Y.sol";
import "./interfaces/ILSP1_UniversalReceiver.sol";
import "./interfaces/ILSP1_UniversalReceiverDelegate.sol";
import "./interfaces/IERC1271.sol";
import "./interfaces/IERC173.sol";


// >> INTERFACES

// ERC725 - Smart Contract based Account
bytes4 constant _INTERFACE_ID_ERC725X = type(IERC725X).interfaceId;
bytes4 constant _INTERFACE_ID_ERC725Y = type(IERC725Y).interfaceId;
bytes4 constant _INTERFACE_ID_ERC725ACCOUNT = 0x63cb749b;

// LSP1 - Universal Receiver
bytes4 constant _INTERFACE_ID_LSP1 = type(ILSP1).interfaceId;
bytes4 constant _INTERFACE_ID_LSP1DELEGATE = type(ILSP1Delegate).interfaceId;

// ERC1271 - Standard Signature Validation
bytes4 constant _INTERFACE_ID_ERC1271 = type(IERC1271).interfaceId;

// ERC173 - Contract Ownership Standard
bytes4 constant _INTERFACE_ID_ERC173 = type(IERC173).interfaceId;


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
