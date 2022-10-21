// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// ERC165 INTERFACE IDs
bytes4 constant _INTERFACEID_ERC725X = 0x44c028fe;
bytes4 constant _INTERFACEID_ERC725Y = 0x714df77c;

// ERC725X OPERATION TYPES
uint256 constant OPERATION_0_CALL = 0;
uint256 constant OPERATION_1_CREATE = 1;
uint256 constant OPERATION_2_CREATE2 = 2;
uint256 constant OPERATION_3_STATICCALL = 3;
uint256 constant OPERATION_4_DELEGATECALL = 4;

// ERC725Y overloaded function selectors
bytes4 constant SETDATA_SELECTOR = bytes4(keccak256("setData(bytes32,bytes)"));
bytes4 constant SETDATA_ARRAY_SELECTOR = bytes4(keccak256("setData(bytes32[],bytes[])"));
