// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.7.0;

/**
 * @title ERC734 Key Manager
 * @dev Contract to manage keys that can execute external smart contracts.
 *
 * ERC 165 interface id: 0x?
 *
 */
interface IERC734 /* is ERC165 */ {

    /**
    * @dev Emitted when a key is added
    */
    event KeyAdded(bytes32 indexed key, uint256 indexed purpose, uint256 indexed keyType);

    /**
    * @dev Emitted when a key is removed
    */
    event KeyRemoved(bytes32 indexed key, uint256 indexed purpose, uint256 indexed keyType);

    /**
    * @dev Emitted when a execution is requested
    */
    event ExecutionRequested(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);

    /**
    * @dev Emitted when an execution is executed
    */
    event Executed(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);

    /**
    * @dev Emitted when `approve` is called
    */
    event Approved(uint256 indexed executionId, bool approved);

    /**
    * @dev Emitted when an `changeKeysRequired` is called
    */
    event KeysRequiredChanged(uint256 purpose, uint256 number);


    /**
     * @dev Gets the data for a key
     */
    function getKey(bytes32 _key) constant returns(uint256[] purposes, uint256 keyType, bytes32 key);

    /**
     * @dev Returns TRUE if a key has a certain purpose
     */
    function keyHasPurpose(bytes32 _key, uint256 purpose) constant returns(bool exists);

    /**
     * @dev Return an array of keys that fit a given purpose
     */
    function getKeysByPurpose(uint256 _purpose) constant returns(bytes32[] keys);


    /**
     * @dev Sets data at a given `key`.
     * SHOULD only be callable by the owner of the contract set via ERC173.
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 key, bytes memory value) external;
}
