// SPDX-License-Identifier: Apache-2.0
/*
 * @title Solidity Utils
 * @author Fabian Vogelsteller <fabian@lukso.network>
 *
 * @dev Utils functions
 */

pragma solidity >=0.5.0 <0.7.0;


library UtilsLib {

    /**
     * @dev Internal function to determine if an address is a contract
     * @param _target The address being queried
     *
     * @return result Returns TRUE if `_target` is a contract
     */
    function isContract(address _target) internal view returns(bool result) {
        assembly {
            result := gt(extcodesize(_target), 0)
        }
    }
}
