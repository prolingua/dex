import React from 'react';
import { connect } from 'react-redux';

import Spinner from 'react-bootstrap/Spinner';

import actions from "actions";
import {Tabs, Tab } from 'react-bootstrap';

const { creators } = actions;

const ShowTradedOrders = (tradedOrders) => {
  return(
    <tbody>
      { tradedOrders.map((order) => {
        let date =  new Date (order.timestamp * 1000);
        let stringDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() < 10 ? '0' : '') + date.getUTCMonth() + '-' + (date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate();
        let stringHour = (date.getUTCHours() < 10 ? '0' :'') + date.getUTCHours() + ':' + (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds();   
        return(
          <tr key={order.id}>
            <td className="text-muted">{stringDate}&nbsp;&nbsp;&nbsp;{stringHour}</td>
            <td align="right">{(order.amountGet/(10**18)).toFixed(4)}</td>
            <td align="right">{(order.amountGive/(10**18)).toFixed(4)}</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

const DappTrades = ({ stateProps, dispatchProps }) => {
  return (
    <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Traded Orders
          </div>
          <div className="card-body">
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
                  {ShowTradedOrders(stateProps.tradedDappEthOrders)}
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
                  {ShowTradedOrders(stateProps.tradedEthDappOrders)}
                </table>
              </Tab>
            </Tabs>            
          </div>
        </div>
      </div>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      tradedDappEthOrders: state.general.blockchain.tradedDappEthOrders,
      tradedEthDappOrders: state.general.blockchain.tradedEthDappOrders
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

export default connect(mapStateToProps, mapDispatchToProps)(DappTrades);
