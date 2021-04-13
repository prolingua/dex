// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Exchange {
    using SafeMath for uint;

    address public feeAccount; // the account that receives exchange
    uint256 public feePercent;
    address constant ETHER = address(0);
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;
    mapping(uint256 => bool) public filledOrders;

    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    event Trade(
        uint256 id, 
        address user,
        address tokenGet, 
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive,
        address fillingUser, 
        uint256 timestamp
    );
    
    struct _Order {
        uint id;
        address user;
        address tokenGet;
        uint amountGet;
        address tokenGive;
        uint amountGive;
        uint timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function() external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _tokenAddress, uint _amount) public {    
        require(_tokenAddress != ETHER);    
        require(Token(_tokenAddress).transferFrom(msg.sender, address(this), _amount));         
        tokens[_tokenAddress][msg.sender] = tokens[_tokenAddress][msg.sender].add(_amount);         
        emit Deposit(_tokenAddress, msg.sender, _amount, tokens[_tokenAddress][msg.sender]);
    }

    function withdrawToken(address _tokenAddress, uint _amount) public {
        require(_tokenAddress != ETHER);    
        require(tokens[_tokenAddress][msg.sender] >= _amount);         
        tokens[_tokenAddress][msg.sender] = tokens[_tokenAddress][msg.sender].sub(_amount); 
        require(Token(_tokenAddress).transfer(msg.sender, _amount));
        emit Withdraw(_tokenAddress, msg.sender, _amount, tokens[_tokenAddress][msg.sender]);
    }

    function balanceOf(address _tokenAddress, address _user) public view returns (uint256) {
        return tokens[_tokenAddress][_user];
    }
    
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }

    function cancelOrder(uint256 _orderId) public {        
        _Order storage _order = orders[_orderId];
        require(address(_order.user) == msg.sender);
        require(_order.id == _orderId);
        cancelledOrders[_orderId] = true;
        emit Cancel(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive,now);
    }

    function fillOrder(uint256 _orderId) public {
        require(_orderId > 0 && _orderId <= orderCount);
        require(!cancelledOrders[_orderId]);
        require(!filledOrders[_orderId]);
        _Order storage _order = orders[_orderId];
        require(address(_order.user) != msg.sender);
        require(_order.id == _orderId);
        require(_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive));
        filledOrders[_orderId] = true;
    }

    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal returns (bool success) {
        uint256 _feeAmount = _amountGet.mul(feePercent).div(100);
        require(tokens[_tokenGet][msg.sender] >= _amountGet.add(_feeAmount));
        require(tokens[_tokenGive][_user] >= _amountGive);

        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
        
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);

        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);    
        emit Trade(_orderId, _user, _tokenGet, _amountGet,  _tokenGive,  _amountGive, msg.sender, now);
        return true;
    }
}
