// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IERC173 {

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function owner() external view returns (address);

    function transferOwnership(address newOwner) external;

    function renounceOwnership() external;
    
}