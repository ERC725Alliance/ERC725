// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {OPERATION_DELEGATECALL} from "../constants.sol";

abstract contract DelegateCallProxyGuard {
    
    modifier delegateCallProxyGuard(uint256 _operationType) {
        if (_operationType == OPERATION_DELEGATECALL) {
            
            // do delegatecall
            _;

            bool initialisedLock;
            bool initiatedOwnerLock;

            assembly {
                let slot0 := sload(0)
                initialisedLock := eq(and(0x000000000000000000000000000000000000000000ff, slot0), 1)
                initiatedOwnerLock := eq(and(0xff000000000000000000000000000000000000000000, slot0), 1)
            }

            require(initialisedLock, "ERC725XInit: Operation DELEGATECALL cannot remove the initialised lock");
            require(initiatedOwnerLock, "ERC725XInit: Operation DELEGATECALL cannot remove the initiatedOwner lock");
        }
    }

}