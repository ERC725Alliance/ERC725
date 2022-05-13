// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract ProxyBreaker {

    function turnOffInitialised() public {
        bytes32 slot0;

        assembly {
            slot0 := sload(0)
        }

        // unset the lowest byte corresponding to the specific offsets
        bytes32 removeInitialised = (slot0) & ~(bytes32(uint256(1)) << 0);

        assembly {
            sstore(0, removeInitialised)
        }

    }

    function turnOffInitiatedOwner() public {
        bytes32 slot0;

        assembly {
            slot0 := sload(0)
        }

        // unset the lowest byte corresponding to the specific offset
        bytes32 removeInitiatedOwner = (slot0) & ~(bytes32(uint256(1)) << 176);

        assembly {
            sstore(0, removeInitiatedOwner)
        }

    }
}