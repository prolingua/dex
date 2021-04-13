import React from "react";
import { connect } from "react-redux";
import './IEDapp.css';
import Spinner from 'react-bootstrap/Spinner';


/* import moment from 'moment';


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';

import { DisplayInfoDialog, GetUrlParam, GetClaimsFromToken } from "common/helpers"
import { Get } from "common/server"; */
//import LoggedOutTemplate from "app/pages/templates/LoggedOutTemplate";
import actions from "actions";
import Web3 from 'web3';

import Token from '../../abis/Token.json';
import Exchange from '../../abis/Exchange.json';

import DappContent from './DappContent'


import { ETHER_ADDRESS } from '../../common/helpers';
const { creators } = actions;
var firstLoading = true;
var notSubcribedToEvents = true;

const IEDapp =  ({ stateProps, dispatchProps }) => {

  if(firstLoading){
    firstLoading = false;
    dispatchProps.changeState([
      {path:["blockchain","startingBlockchainData"], value: true}
    ]);
    loadBlockchainData(dispatchProps);
  }
  
  if(notSubcribedToEvents && stateProps.token && stateProps.exchange){
    notSubcribedToEvents = false;
    subscribeToEvents(stateProps, dispatchProps);
  }

  return (
    <React.Fragment>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="#/">Dapp Token Exchange</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a
                className="nav-link small"
                href={stateProps.networkId === 42 ? `https://kovan.etherscan.io/address/${stateProps.account}` : `https://etherscan.io/address/${stateProps.account}`}
                target="_blank"
                rel="noopener noreferrer"
              >
              {stateProps.account}
            </a>
          </li>
        </ul>
        </nav>
        {stateProps.startingBlockchainData ? <Spinner size="sm" animation="border" /> : <DappContent/> }
    </React.Fragment>
    
  );
}

async function subscribeToEvents(stateProps, dispatchProps){

  stateProps.exchange.events.Withdraw({}, (error, event) =>
    loadBlockchainData(dispatchProps)
  )

  stateProps.exchange.events.Deposit({}, (error, event) =>
    loadBlockchainData(dispatchProps)
  )

  stateProps.exchange.events.Order({}, (error, event) => 
    loadBlockchainData(dispatchProps)  
  )

  stateProps.exchange.events.Cancel({}, (error, event) => 
    loadBlockchainData(dispatchProps)  
  )

  stateProps.exchange.events.Trade({}, (error, event) => 
    loadBlockchainData(dispatchProps)  
  )

  stateProps.token.events.Transfer({}, (error, event) => 
    loadBlockchainData(dispatchProps))
}

async function loadBlockchainData(dispatchProps){  

  if(typeof(!window.ethereum)){
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.requestAccounts();

    if(accounts && accounts.length > 0)
    {
      const account = accounts[0]; 
      const tokenNetwork = Token.networks[networkId];
      const exchangeNetwork = Exchange.networks[networkId]
      console.log(tokenNetwork);
      console.log(exchangeNetwork);

      if(typeof tokenNetwork === 'undefined' || typeof exchangeNetwork === 'undefined') {
        window.alert('The smart contracts not detected on the current network. Please select another network with Metamask.');
      } else {
        const tokenAddress = tokenNetwork.address;
        const exchangeAddress = exchangeNetwork.address;
        const token = new web3.eth.Contract(Token.abi, tokenAddress);
        const exchange = new web3.eth.Contract(Exchange.abi, exchangeAddress);
        if(!token || !exchange) {
          window.alert('Token smart contract not detected on the current network. Please select another network with Metamask.');
        } else {
          const depositStream = await exchange.getPastEvents('Deposit', { fromBlock: 0, toBlock: 'latest'});
          const withDrawStream = await exchange.getPastEvents('Withdraw', { fromBlock: 0, toBlock: 'latest'});
          const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest'});
          const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest'});
          const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest'});
          
          const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
          const exchangeTokenBalance = await exchange.methods.balanceOf(tokenAddress, account).call();
          const etherBalance = await web3.eth.getBalance(account);
          const tokenBalance = await token.methods.balanceOf(account).call();
          const allowance = await token.methods.allowance(account, exchangeAddress).call();
          
          const orders  = orderStream.map( (item) => {  
              return {  
                        id : item.returnValues.id, 
                        user: item.returnValues.user, 
                        tokenGet: item.returnValues.tokenGet,
                        amountGet: item.returnValues.amountGet,
                        tokenGive: item.returnValues.tokenGive,
                        amountGive: item.returnValues.amountGive,
                        timestamp: item.returnValues.timestamp                        
                      }
            }
          );

          orders.reverse();

          const tradedOrders = tradeStream.map( (item) => {
            return {
                      id : item.returnValues.id, 
                      user: item.returnValues.user, 
                      tokenGet: item.returnValues.tokenGet,
                      amountGet: item.returnValues.amountGet,
                      tokenGive: item.returnValues.tokenGive,
                      amountGive: item.returnValues.amountGive,
                      fillingUser: item.returnValues.fillingUser,
                      timestamp: item.returnValues.timestamp,
                    }
            }
          );

          tradedOrders.reverse();

          const cancelledOrders = cancelStream.map ((item)=> {
            return {
                      id : item.returnValues.id, 
                      user: item.returnValues.user, 
                      tokenGet: item.returnValues.tokenGet,
                      amountGet: item.returnValues.amountGet,
                      tokenGive: item.returnValues.tokenGive,
                      amountGive: item.returnValues.amountGive,
                      timestamp: item.returnValues.timestamp                        
                    }
          });

          cancelledOrders.reverse();

          const myCancelledDappEthOrders = cancelledOrders.filter((item) => {
            return (item.user == account && item.tokenGet == tokenAddress)
          })

          const myCancelledEthDappOrders = cancelledOrders.filter((item) => {
            return (item.user == account && item.tokenGet == ETHER_ADDRESS)
          })
          
          const tradedDappEthOrders = tradedOrders.filter((item) => {
            return item.tokenGive == ETHER_ADDRESS
          });

          const myTradedDappEthOrders = tradedDappEthOrders.filter((item) => {
            return item.fillingUser == account;
          })

          const myFullfilledDappEthOrders = tradedDappEthOrders.filter((item) => {
            return item.user == account;
          })

          const tradedEthDappOrders = tradedOrders.filter((item) => {
            return item.tokenGet == ETHER_ADDRESS
          });

          const myTradedEthDappOrders = tradedEthDappOrders.filter((item) => {
            return item.fillingUser == account
          })

          const myFullfilledEthDappOrders = tradedEthDappOrders.filter((item) => {
            return item.user == account
          })

          const cancelledOrderIds = cancelledOrders.map( (item) => {
            return item.id
          });

          const tradedOrderIds = tradedOrders.map( (item) => {
            return item.id
          });

          const availableOrders = orders.filter((item1) => { 
            return (!cancelledOrderIds.some((item2) => {  return item2 == item1.id }) && !tradedOrderIds.some((item3) => {  return item3 == item1.id }))
          });

          const availableDappEthOrders = availableOrders.filter((item)=> {
            return item.tokenGive == ETHER_ADDRESS
          });

          const myAvailableDappEthOrders = availableDappEthOrders.filter((item)=> {
            return item.user == account;
          });

          const fillableDappEthOrders = availableDappEthOrders.filter((item)=> {
            return item.user != account;
          });

          const availableEthDappOrders = availableOrders.filter((item)=> {
            return item.tokenGet == ETHER_ADDRESS
          });

          const myAvailableEthDappOrders = availableEthDappOrders.filter((item)=> {
            return item.user == account;
          });
          
          const fillableEthDappOrders = availableEthDappOrders.filter((item)=> {
            return item.user != account;
          });

          dispatchProps.changeState([
            { path: ["blockchain", "web3"], value: web3 },
            { path: ["blockchain", "networkId"], value: networkId },
            { path: ["blockchain", "token"], value: token },
            { path: ["blockchain", "tokenAddress"], value: tokenAddress },
            { path: ["blockchain", "exchange"], value: exchange },
            { path: ["blockchain", "exchangeAddress"], value: exchangeAddress },
            { path: ["blockchain", "account"], value: account },
            { path: ["blockchain", "tradedOrders"], value: tradedOrders },
            { path: ["blockchain", "tradedDappEthOrders"], value: tradedDappEthOrders },
            { path: ["blockchain", "tradedEthDappOrders"], value: tradedEthDappOrders },
            { path: ["blockchain", "availableOrders"], value: availableOrders },
            
            { path: ["blockchain", "availableDappEthOrders"], value: availableDappEthOrders },            
            { path: ["blockchain", "availableEthDappOrders"], value: availableEthDappOrders },

            { path: ["blockchain", "myAvailableDappEthOrders"], value: myAvailableDappEthOrders },            
            { path: ["blockchain", "myAvailableEthDappOrders"], value: myAvailableEthDappOrders },
           
            { path: ["blockchain", "myCancelledDappEthOrders"], value: myCancelledDappEthOrders },
            { path: ["blockchain", "myCancelledEthDappOrders"], value: myCancelledEthDappOrders },

            { path: ["blockchain", "myTradedDappEthOrders"], value: myTradedDappEthOrders },
            { path: ["blockchain", "myTradedEthDappOrders"], value: myTradedEthDappOrders },

            { path: ["blockchain", "myFullfilledDappEthOrders"], value: myFullfilledDappEthOrders },
            { path: ["blockchain", "myFullfilledEthDappOrders"], value: myFullfilledEthDappOrders },

            { path: ["blockchain", "fillableDappEthOrders"], value: fillableDappEthOrders },            
            { path: ["blockchain", "fillableEthDappOrders"], value: fillableEthDappOrders },           

            { path: ["blockchain", "allowance"], value: allowance },
            { path: ["blockchain", "exchangeEtherBalance"], value: exchangeEtherBalance },
            { path: ["blockchain", "exchangeTokenBalance"], value: exchangeTokenBalance },
            { path: ["blockchain", "etherBalance"], value: etherBalance },
            { path: ["blockchain", "tokenBalance"], value: tokenBalance },
          ]);
        }      
      }            
    } else{
      alert('Please login with MetaMask');
    }
  }
  else {    
    window.alert('Please install MetaMask');
    window.location.assign("https://metamask.io/")
  }
  dispatchProps.changeState([
    {path:["blockchain","startingBlockchainData"], value: false}
  ]);
}


function mapStateToProps(state) {
  return {
    stateProps: {
      startingBlockchainData: state.general.blockchain.startingBlockchainData,
      loadingOrders: state.general.blockchain.loadingOrders,
      networkId: state.general.blockchain.networkId,
      account:state.general.blockchain.account,
      token: state.general.blockchain.token,
      exchange: state.general.blockchain.exchange
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {
      changeState: (items) => {
        dispatch(creators.changeState({ items }));
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IEDapp);
