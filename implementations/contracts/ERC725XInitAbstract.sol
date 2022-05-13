// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OwnableUnset} from "./utils/OwnableUnset.sol";
import {DelegateCallProxyGuard} from "./utils/DelegateCallProxyGuard.sol";
import {ERC725XCore} from "./ERC725XCore.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725 X Executor
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself,
 * including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system
 */
abstract contract ERC725XInitAbstract is Initializable, DelegateCallProxyGuard, ERC725XCore {

    function _initialize(address _newOwner) internal virtual onlyInitializing {
        // This is necessary to prevent a contract that implements both ERC725X and ERC725Y to call both constructors
        if (_newOwner != owner()) {
            OwnableUnset.initOwner(_newOwner);
        }
    }

    function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override onlyOwner delegateCallProxyGuard(_operation) returns (bytes memory result) {
        super.execute(_operation, _to, _value, _data);
    }
}
