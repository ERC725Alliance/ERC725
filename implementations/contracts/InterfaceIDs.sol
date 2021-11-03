// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./interfaces/IERC1271.sol";
import "./interfaces/ILSP1_UniversalReceiver.sol";
import "./interfaces/ILSP1_UniversalReceiverDelegate.sol";

// ERC725 - Smart Contract based Account
bytes4 constant _INTERFACE_ID_ERC725ACCOUNT = 0x63cb749b;

// LSP1 - Universal Receiver
bytes4 constant _INTERFACE_ID_LSP1 = type(ILSP1).interfaceId;
bytes4 constant _INTERFACE_ID_LSP1DELEGATE = type(ILSP1Delegate).interfaceId; // 0xc2d7bcc1

// ERC1271 - Standard Signature Validation
bytes4 constant _INTERFACE_ID_ERC1271 = type(IERC1271).interfaceId; // 0x1626ba7e
