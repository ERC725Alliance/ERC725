// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.1;


// NOTE: this contract is not fully tested!

contract ERC734KeyManager {
    event KeySet(bytes32 indexed key, uint256 indexed purposes, uint256 indexed keyType);
    event KeyRemoved(bytes32 indexed key, uint256 indexed purposes, uint256 indexed keyType);

    uint256 constant MANAGEMENT_KEY = 1;
    uint256 constant EXECUTION_KEY = 2;

    uint256 constant ECDSA_TYPE = 1;
    uint256 constant RSA_TYPE = 2;

    struct Key {
        // Purposes are represented via bitmasks
        // Maximum number of purposes is 256 and must be integers that are power of 2 e.g.:
        // 1, 2, 4, 8, 16, 32, 64 ...
        // All other integers represent multiple purposes e.g:
        // Integer 3 (011) represent both 1 (001) and 2 (010) purpose
        uint256 purposes;
        uint256 keyType;
    }

    mapping (bytes32 => Key) keys;
    bool initialized;

    modifier onlyManagementKeyOrSelf() {
        if (msg.sender != address(this)) {
            require(keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), MANAGEMENT_KEY), "sender-must-have-management-key");
        }
        _;
    }

    function initialize() public {
        require(!initialized, "contract-already-initialized");
        initialized = true;
        bytes32 key = keccak256(abi.encodePacked(msg.sender));
        keys[key].keyType = ECDSA_TYPE;
        keys[key].purposes = MANAGEMENT_KEY;
    }

    function getKey(bytes32 _key) public view returns (uint256 _purposes, uint256 _keyType) {
        return (keys[_key].purposes, keys[_key].keyType);
    }

    function keyHasPurpose(bytes32 _key, uint256 _purpose) public view returns (bool) {
        // Only purposes that are power of 2 are allowed e.g.:
        // 1, 2, 4, 8, 16, 32, 64 ...
        // Integers that represent multiple purposes are not allowed
        require(_purpose != 0 && (_purpose & (_purpose - uint256(1))) == 0, "purpose-must-be-power-of-2");
        return (keys[_key].purposes & _purpose) != 0;
    }

    function setKey(bytes32 _key, uint256 _purposes, uint256 _keyType) public onlyManagementKeyOrSelf {
        require(_key != 0x0, "invalid-key");
        keys[_key].purposes = _purposes;
        keys[_key].keyType = _keyType;
        emit KeySet(_key, _purposes, _keyType);
    }

    function removeKey(bytes32 _key) public onlyManagementKeyOrSelf {
        require(_key != 0x0, "invalid-key");
        Key memory key = keys[_key];
        delete keys[_key];
        emit KeyRemoved(_key, key.purposes, key.keyType);
    }
}
