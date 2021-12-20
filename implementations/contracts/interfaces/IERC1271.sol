// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

/**
 * @notice ERC-1271: Standard Signature Validation Method for Contracts
 */
interface IERC1271 {
    //    bytes4 internal constant _ERC1271MAGICVALUE = 0x1626ba7e;
    //    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    /**
     * @dev Should return whether the signature provided is valid for the provided data
     * @param hash The hash of the data signed on the behalf of address
     * @param signature The Owner's signature(s) of the data
     *
     * @return magicValue Either `0x1626ba7e` on success or `0xffffffff` on failure
     */
    function isValidSignature(
        bytes32 hash, //bytes memory _data,
        bytes memory signature
    ) external view returns (bytes4 magicValue);
}
