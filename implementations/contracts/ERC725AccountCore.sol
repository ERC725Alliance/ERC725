// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "./constants.sol";

// interfaces
import "./LSP1UniversalReceiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

// libraries
import "./utils/UtilsLib.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// modules
import "./ERC725XCore.sol";
import "./ERC725YCore.sol";

/**
 * @title Core implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract ERC725AccountCore is ERC725XCore, ERC725YCore, LSP1UniversalReceiver, IERC1271 {
    /**
     * @notice Emitted when a native token is received
     * @param sender The address of the sender
     * @param value The amount of value sent
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Emits an event when a native token is received
     */
    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
    }

    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
        public
        view
        override
        returns (bytes4 magicValue)
    {
        // prettier-ignore
        // if OWNER is a contract
        if (UtilsLib.isContract(owner())) {
            return 
                supportsInterface(_INTERFACEID_ERC1271)
                    ? IERC1271(owner()).isValidSignature(_hash, _signature)
                    : _ERC1271FAILVALUE;
        // if OWNER is a key
        } else {
            return 
                owner() == ECDSA.recover(_hash, _signature)
                    ? _INTERFACEID_ERC1271
                    : _ERC1271FAILVALUE;
        }
    }

    //    TODO to be discussed
    //    function fallback()
    //    public
    //    {
    //        address to = owner();
    //        assembly {
    //            calldatacopy(0, 0, calldatasize())
    //            let result := staticcall(gas(), to, 0, calldatasize(), 0, 0)
    //            returndatacopy(0, 0, returndatasize())
    //            switch result
    //            case 0  { revert (0, returndatasize()) }
    //            default { return (0, returndatasize()) }
    //        }
    //    }
}
