import React from 'react';
import { connect } from 'react-redux';

import {Tabs, Tab } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner';

import actions from "actions";

import { ETHER_ADDRESS } from '../../common/helpers';

const { creators } = actions;

async function fillOrder(order, stateProps, dispatchProps) {

  dispatchProps.changeState([
    { path:["blockchain", "startingFillingOrder"], value: true }
  ]);

  const amountToFullfill = (order.amountGet/(10**18)).toFixed(4);
  const tokenToFullfill = order.tokenGet === ETHER_ADDRESS ? "ETH" : "DAPP";
  const amountToObtain = (order.amountGive/(10**18)).toFixed(4);
  const tokenToObtain = tokenToFullfill === "ETH" ? "DAPP" : "ETH";
  const amountAvailableToFullfill = tokenToFullfill === "ETH" ? stateProps.exchangeEtherBalance/(10**18) : stateProps.exchangeTokenBalance/(10**18);
  const amountAvailableToObtain = tokenToFullfill === "ETH" ? 
                (await stateProps.exchange.methods.balanceOf(stateProps.tokenAddress, order.user).call())/(10**18) :
                (await stateProps.exchange.methods.balanceOf(ETHER_ADDRESS, order.user).call())/(10**18);

  //console.log('Amount to fullfil ', amountToFullfill);
  //console.log('Token to fullfil ', tokenToFullfill);
  //console.log('Amount to obtain ', amountToObtain);
  //console.log('Amount available to fullfil ', amountAvailableToFullfill);
  //console.log('Amount available to obtain', amountAvailableToObtain);

  if (amountToFullfill > amountAvailableToFullfill){
    dispatchProps.changeState([
      { path: ["modal", "open"], value: true },
      { path: ["modal","content"], value: "InfoDialog"},
      { path: ["modal", "header"], value: "Error"},
      { path: ["modal", "body"], value: `You don't have enough ${tokenToFullfill} in deposit to fullfil this order.`}
    ]);
  } else {
    if(amountToObtain > amountAvailableToObtain) {
      dispatchProps.changeState([
        { path: ["modal", "open"], value: true },
        { path: ["modal","content"], value: "InfoDialog"},
        { path: ["modal", "header"], value: "Error"},
        { path: ["modal", "body"], value: `The person who made the order dosen't have enough ${tokenToObtain} in deposit to exchange.`}
      ]);
    } else {
      try{
        await stateProps.exchange.methods.fillOrder(order.id).send({from: stateProps.account})
      } catch(error) {
        console.log(error);
        dispatchProps.changeState([
          { path: ["modal", "open"], value: true },
          { path: ["modal","content"], value: "InfoDialog"},
          { path: ["modal", "header"], value: "Error"},
          { path: ["modal", "body"], value: `${error.message}`}
        ]);
      }
    }
  }  

  dispatchProps.changeState([
    { path:["blockchain", "startingFillingOrder"], value: false }
  ]);
}

const ShowAvailableOrders = (fillableOrders, stateProps, dispatchProps) => {
  return(
    <tbody>
      { fillableOrders.map((order) => {
        let date =  new Date (order.timestamp * 1000);
        let stringDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() < 10 ? '0' : '') + date.getUTCMonth() + '-' + (date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate();
        let stringHour = (date.getUTCHours() < 10 ? '0' :'') + date.getUTCHours() + ':' + (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds();   
        return(
          <OverlayTrigger
            key={order.id}
            placement='auto'
            overlay={
              <Tooltip id={order.id}>
                Click here to fill this order
              </Tooltip>
          }
          >
          <tr key={order.id} className="order-book-order"
            onClick={(e) => {
              {
                fillOrder(order, stateProps, dispatchProps);
              }
            }}
          >
            <td className="text-muted">{stringDate}&nbsp;&nbsp;&nbsp;{stringHour}</td>
            <td align="right">{(order.amountGet/(10**18)).toFixed(4)}</td>
            <td align="right">{(order.amountGive/(10**18)).toFixed(4)}</td>
          </tr>
          </OverlayTrigger>
        )
      }) }
    </tbody>
  )
}

const DappOrderBook = ({ stateProps, dispatchProps }) => {
  return (
    <div className="vertical">
      <div className="card bg-dark text-white">
        <div className="card-header">
          Open Orders
        </div>
        <div className="card-body order-book">
        <table className="table table-dark table-sm small">
          <Tabs defaultActiveKey="dapp-eth" className="bg-dark text-white">
          <Tab eventKey="dapp-eth" title="Dapp-Eth" className="bg-dark">
                <table className="table table-dark table-sm small">
                  <thead>
                    <tr>
                      <td>Time</td>
                      <td align="right">DAPP</td>
                      <td align="right">ETH</td>
                    </tr>
                  </thead>
                  {stateProps.startingFillingOrder ? <Spinner size="sm" animation="border" /> : ShowAvailableOrders(stateProps.fillableDappEthOrders, stateProps, dispatchProps)}
                </table>
              </Tab>
              <Tab eventKey="eth-dapp" title="Eth-Dapp" className="bg-dark">
                <table className="table table-dark table-sm small">
                  <thead>
                    <tr>
                      <td>Time</td>
                      <td align="right">ETH</td>
                      <td align="right">DAPP</td>
                    </tr>
                  </thead>
                  {stateProps.startingFillingOrder ? <Spinner size="sm" animation="border" /> :  ShowAvailableOrders(stateProps.fillableEthDappOrders, stateProps, dispatchProps)}
                </table>
              </Tab>
            </Tabs>
          </table>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      fillableDappEthOrders: state.general.blockchain.fillableDappEthOrders,
      fillableEthDappOrders: state.general.blockchain.fillableEthDappOrders,
      startingFillingOrder: state.general.blockchain.startingFillingOrder,
      exchange: state.general.blockchain.exchange,
      account: state.general.blockchain.account,
      tokenAddress: state.general.blockchain.tokenAddress,
      exchangeEtherBalance : state.general.blockchain.exchangeEtherBalance,
      exchangeTokenBalance : state.general.blockchain.exchangeTokenBalance,
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

export default connect(mapStateToProps, mapDispatchToProps)(DappOrderBook);
