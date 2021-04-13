import React from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner';

import actions from "actions";
const { creators } = actions;

const OrderBookDetails = (order, stateProps, dispatchProps) => {
  return (
    <OverlayTrigger
      key={order.id}
      placement='auto'
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr
        key={order.id}
        className="order-book-order"
        onClick={(e) => {
            {
            //fillOrder(dispatch, exchange, order, account)
            }
          }
        }
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  )
}


const OrderBook = ({stateProps, dispatchProps}) => {
  return (
    <tbody>
      {stateProps.orderBook.sellOrders.map((order) => OrderBookDetails(order, stateProps, dispatchProps))}
      <tr>
        <th>DAPP</th>
        <th>DAPP/ETH</th>
        <th>ETH</th>
      </tr>
      {stateProps.orderBook.buyOrders.map((order) => OrderBookDetails(order, stateProps, dispatchProps))}
    </tbody>
  )
}

async function cancelOrder(orderId, stateProps, dispatchProps) {

  dispatchProps.changeState([
    { path:["blockchain", "startingCancellingOrder"], value: true }
  ]);

  try{
    await stateProps.exchange.methods.cancelOrder(orderId).send({from: stateProps.account})
  } catch(error){
    // do something here;
    console.log(error);
  }
  dispatchProps.changeState([
    { path:["blockchain", "startingCancellingOrder"], value: false }
  ]);
}

const ShowAvailableOrders = (myAvailableOrders, stateProps, dispatchProps) => {

  return(
    <tbody>
      { myAvailableOrders.map((order) => {
        let date =  new Date (order.timestamp * 1000);
        let stringDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() < 10 ? '0' : '') + date.getUTCMonth() + '-' + (date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate();
        let stringHour = (date.getUTCHours() < 10 ? '0' :'') + date.getUTCHours() + ':' + (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds();   
        return(
          <OverlayTrigger
            key={order.id}
            placement='bottom'
            overlay={
              <Tooltip id={order.id}>
                Click here to cancel this order
              </Tooltip>
          }
          >
          <tr key={order.id} className="order-book-order"
            onClick={(e) => {
              {
                cancelOrder(order.id, stateProps, dispatchProps);
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

const DappMyOpenOrder = ({ stateProps, dispatchProps }) => {
  return (
    <div className="vertical">
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Open Orders
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
                  {stateProps.startingCancellingOrder ? <Spinner size="sm" animation="border" /> : ShowAvailableOrders(stateProps.myAvailableDappEthOrders, stateProps, dispatchProps)}
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
                  {stateProps.startingCancellingOrder ? <Spinner size="sm" animation="border" /> : ShowAvailableOrders(stateProps.myAvailableEthDappOrders, stateProps, dispatchProps)}
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
      myAvailableDappEthOrders: state.general.blockchain.myAvailableDappEthOrders,
      myAvailableEthDappOrders: state.general.blockchain.myAvailableEthDappOrders,
      startingCancellingOrder: state.general.blockchain.startingCancellingOrder,
      exchange: state.general.blockchain.exchange,
      account: state.general.blockchain.account   
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

export default connect(mapStateToProps, mapDispatchToProps)(DappMyOpenOrder);
