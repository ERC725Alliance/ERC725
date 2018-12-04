pragma solidity ^0.4.24;

contract KeyManager {
  event KeyAdded(bytes32 indexed key, uint256 indexed keyType, uint256 indexed purposes);
  event KeyRemoved(bytes32 indexed key, uint256 indexed keyType, uint256 indexed purposes);
  event KeyPurposeAdded(bytes32 indexed key, uint256 indexed purpose);
  event KeyPurposeRemoved(bytes32 indexed key, uint256 indexed purpose);

  uint256 constant MANAGEMENT_KEY = 1;
  uint256 constant EXECUTION_KEY = 2;

  uint256 constant ECDSA_TYPE = 1;
  uint256 constant RSA_TYPE = 2;

  struct Key {
    uint256 purposes;
    uint256 keyType;
  }

  mapping (bytes32 => Key) keys;

  modifier onlyManagementKeyOrSelf() {
    if (msg.sender != address(this)) {
      require(keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), MANAGEMENT_KEY), "Sender does not have management key");
    }
    _;
  }

  constructor() public {
    bytes32 key = keccak256(abi.encodePacked(msg.sender));
    keys[key].keyType = ECDSA_TYPE;
    keys[key].purposes = MANAGEMENT_KEY;
  }

  function getKey(bytes32 _key) public view returns (uint256 _keyType, uint256 _purposes) {
    return (keys[_key].keyType, keys[_key].purposes);
  }

  function keyHasPurpose(bytes32 _key, uint256 _purpose) public view returns (bool) {
    require(_purpose != 0 && (_purpose & (_purpose - uint256(1))) == 0, "Purpose is not power of 2");
    return (keys[_key].purposes & _purpose) != 0;
  }

  function setKey(bytes32 _key, uint256 _keyType, uint256 _purposes) public onlyManagementKeyOrSelf {
    require(_key != 0x0, "Invalid key");
    keys[_key].purposes = _purposes;
    keys[_key].keyType = _keyType;
    emit KeyAdded(_key, _keyType, _purposes);
  }

  function removeKey(bytes32 _key) public onlyManagementKeyOrSelf {
    require(_key != 0x0, "Invalid key");
    Key memory key = keys[_key];
    delete keys[_key];
    emit KeyRemoved(_key, key.keyType, key.purposes);
  }
}
