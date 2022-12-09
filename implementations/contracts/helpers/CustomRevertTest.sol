// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev Contract used for testing implementing a receive function that reverts;
 */
contract RevertTester {
    error MyCustomError(address sender, address initiater);

    receive() external payable {
        // solhint-disable-next-line avoid-tx-origin
        revert MyCustomError(msg.sender, tx.origin);
    }

    function revertMeWithStringView() public view {
        revert("I reverted");
    }

    function revertMeWithStringErrorNotView() public {
        revert("I reverted");
    }

    function revertMeWithCustomErrorView() public {
        // solhint-disable-next-line avoid-tx-origin
        revert MyCustomError(msg.sender, tx.origin);
    }

    function revertMeWithCustomErrorNotView() public {
        // solhint-disable-next-line avoid-tx-origin
        revert MyCustomError(msg.sender, tx.origin);
    }
}
