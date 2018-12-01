pragma solidity ^0.4.24;

contract KeyManager {
  event KeyAdded(bytes32 indexed key, uint256 indexed keyType);
  event KeyRemoved(bytes32 indexed key, uint256 indexed keyType);
  event KeyPurposeAdded(bytes32 indexed key, uint256 indexed purpose);
  event KeyPurposeRemoved(bytes32 indexed key, uint256 indexed purpose);

  uint256 constant MANAGEMENT_KEY = 1;
  uint256 constant EXECUTION_KEY = 2;

  struct Key {
    mapping(uint256 => bool) purposes; //e.g., MANAGEMENT_KEY = 1, EXECUTION_KEY = 2, etc.
    uint256 keyType; // e.g. 1 = ECDSA, 2 = RSA, etc.
  }

  mapping (bytes32 => Key) keys;

  modifier onlyManagementKeyOrSelf() {
    if (msg.sender != address(this)) {
      require(keys[keccak256(abi.encodePacked(msg.sender))].purposes[MANAGEMENT_KEY], "Sender does not have management key");
    }
    _;
  }

  constructor() public {
    bytes32 key = keccak256(abi.encodePacked(msg.sender));
    keys[key].keyType = 1;
    keys[key].purposes[MANAGEMENT_KEY] = true;
  }

  function getKeyType(bytes32 _key) public view returns (uint256 _keyType) {
    return keys[_key].keyType;
  }

  function keyHasPurpose(bytes32 _key, uint256 _purpose) public view returns (bool exists) {
    return keys[_key].purposes[_purpose];
  }

  function addKey(bytes32 _key, uint256 _keyType) public onlyManagementKeyOrSelf {
    require(_key != 0x0, "Invalid key");
    require(_keyType != 0, "Invalid key type");
    require(keys[_key].keyType == 0, "Key already added");
    keys[_key].keyType = _keyType;
    emit KeyAdded(_key, _keyType);
  }

  function addKeyPurpose(bytes32 _key, uint256 _purpose) public onlyManagementKeyOrSelf {
    require(_purpose > 0, "Invaild key purpose");
    require(!keys[_key].purposes[_purpose], "Purpose already added");
    keys[_key].purposes[_purpose] = true;
    emit KeyPurposeAdded(_key, _purpose);
  }

  function removeKeyPurpose(bytes32 _key, uint256 _purpose) public onlyManagementKeyOrSelf {
    require(_purpose > 0, "Invaild key purpose");
    require(keys[_key].purposes[_purpose], "Purpose does not exist");
    keys[_key].purposes[_purpose] = false;
    emit KeyPurposeRemoved(_key, _purpose);
  }

  function removeKey(bytes32 _key) public onlyManagementKeyOrSelf {
    require(_key != 0x0, "Invalid key");
    Key storage key = keys[_key];
    require(key.keyType != 0, "Key does not exist");
    delete keys[_key];
    emit KeyRemoved(_key, key.keyType);
  }
}
