// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title An ERC20 token in exchange for Eth
/// @author Iwan Effendi
/// @notice Used in conjuction with Exchange contract
/// @dev Inherit ERC20. Overriding function has been unit tested
contract Token is ERC20 {

    address public spender;
    
    /// @notice initialize the spender who can transfer tokens from one account to another, the total number of the tokens
    /// @dev give the deployer all the tokens
    /// @param _spender the contract that will transfer tokens to itself
    /// @param _totalSupply the total number of tokens that are minted
    constructor(address _spender, uint256 _totalSupply) public payable ERC20("Dapp Token", "DAPP"){
        spender = _spender;
        _mint(msg.sender,_totalSupply);
    }        

    /// @notice transfer from one account to another by the spender which is Exchange contract; Exchange will transfer tokens from an address to Exchange itself
    /// @dev it calls _transfer of ERC20; this function can only be called by Exchange to transfer the token to itself
    /// @param _from the address which the token comes from
    /// @param _to the address which the token is transferred to
    /// @param _value the amount of tokens to be transferred
    /// @return success indicating if the transfer is successful
    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
        require(msg.sender == spender);
        require(_to != address(0), "Invalid receipient address");
        require(_from != address(0), "Invalid sender address");
        require(balanceOf(_from) >= _value);

        _transfer(_from, _to, _value);

        return true;

    }
}