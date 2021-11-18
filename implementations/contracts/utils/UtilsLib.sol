// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/*
 * @title Solidity Utils
 * @author Fabian Vogelsteller <fabian@lukso.network>
 *
 * @dev Utils functions
 */
library UtilsLib {
    /**
     * @dev Internal function to determine if an address is a contract
     * @param _target The address being queried
     *
     * @return result Returns TRUE if `_target` is a contract
     */
    function isContract(address _target) internal view returns (bool result) {
        // solhint-disable no-inline-assembly
        assembly {
            result := gt(extcodesize(_target), 0)
        }
    }
}
