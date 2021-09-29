// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./ERC725.sol";
import "../IERC1271.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../helpers/UtilsLib.sol";
import "../Utils/ERC725Utils.sol";

// interfaces
import "../ILSP1/ILSP1_UniversalReceiver.sol";
import "../ILSP1/ILSP1_UniversalReceiverDelegate.sol";
import "./ERC725AccountCore.sol";

/**
 * @title ERC725Account
 * @dev Bundles ERC725X and ERC725Y, and ERC1271 and allows receiving native tokens.
 *
 *  @author Fabian Vogelsteller <fabian@lukso.network>
 */

// TODO add ERC777, ERC223, ERC721 functions?

contract ERC725Account is ERC725, ERC725AccountCore  {

    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract.
     */
    constructor(address _newOwner) ERC725(_newOwner){
        // set SupportedStandards > ERC725Account
        bytes32 key = bytes32(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6); // SupportedStandards > ERC725Account
        store[key] = abi.encodePacked(bytes4(0xafdeb5d6)); // bytes4(keccak256('ERC725Account')
        emit DataChanged(key, store[key]);

        _registerInterface(_INTERFACE_ID_ERC1271);
        _registerInterface(_INTERFACE_ID_LSP1);
    }

        function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override(ERC725X,ERC725XCore) onlyOwner returns(bytes memory result) {
        result = ERC725X.execute(_operation,_to,_value,_data);
    }

        function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual override(ERC725Y,ERC725YCore) onlyOwner {
         ERC725Y.setData(_keys, _values);
    }

}
