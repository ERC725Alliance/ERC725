pragma solidity ^0.8.0;

contract Contract {
    
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }
}