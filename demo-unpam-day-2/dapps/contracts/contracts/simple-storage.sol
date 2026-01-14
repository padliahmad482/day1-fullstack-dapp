
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;
    string public message; 

    event ValueUpdated(uint256 newValue);
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() { 
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), msg.sender);
    }

    function setValue(uint256 _value) public onlyOwner { 
        storedValue = _value;
        emit ValueUpdated(_value);
    }

    function setMessage(string memory _message) public onlyOwner { 
        message = _message;
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }
}