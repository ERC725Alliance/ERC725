pragma solidity ^0.5.1;

interface ERC725 {
    event DataSet(bytes32 indexed key, address indexed value);

    function getData(bytes32 _key) external view returns (address _value);
    function setData(bytes32 _key, address _value) external;
    function execute(uint256 _operationType, address _to, uint256 _value, bytes calldata _data) external;
}
