// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// ERC165 INTERFACE IDs
bytes4 constant _INTERFACEID_ERC725X = 0x7545acac;
bytes4 constant _INTERFACEID_ERC725Y = 0x629aa694;

// ERC725X function selectors
bytes4 constant EXECUTE_SELECTOR = 0x44c028fe;
bytes4 constant EXECUTE_BATCH_SELECTOR = 0x31858452;

// ERC725X OPERATION TYPES
uint256 constant OPERATION_0_CALL = 0;
uint256 constant OPERATION_1_CREATE = 1;
uint256 constant OPERATION_2_CREATE2 = 2;
uint256 constant OPERATION_3_STATICCALL = 3;
uint256 constant OPERATION_4_DELEGATECALL = 4;

// ERC725Y function selectors
bytes4 constant SETDATA_SELECTOR = 0x7f23690c;
bytes4 constant SETDATA_BATCH_SELECTOR = 0x97902421;
