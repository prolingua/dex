import React from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab } from 'react-bootstrap';


import actions from "actions";
const { creators } = actions;

const ShowOrders = (orders) => {
        
  return(    
    <tbody>
      { orders.map((order) => {
        let date =  new Date (order.timestamp * 1000);
        let stringDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() < 10 ? '0' : '') + date.getUTCMonth() + '-' + (date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate();
        let stringHour = (date.getUTCHours() < 10 ? '0' :'') + date.getUTCHours() + ':' + (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds();
        return (      
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

const DappMyTransaction = ({ stateProps, dispatchProps }) => {
  return (
    <div className="card bg-dark text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="bg-dark text-white">
            <Tab eventKey="trades" title="Trades" className="bg-dark">
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
                { ShowOrders(stateProps.myTradedDappEthOrders) }
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
                { ShowOrders(stateProps.myTradedEthDappOrders) }
              </table>
                </Tab>
              </Tabs>             
            </Tab>
            <Tab eventKey="orders" title="Fullfilled Orders">
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
                  { ShowOrders(stateProps.myFullfilledDappEthOrders) }
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
                  {ShowOrders(stateProps.myFullfilledEthDappOrders)}
                  </table>
                </Tab>
              </Tabs>              
            </Tab>
            <Tab eventKey="cancelledorders" title="Cancelled Orders">
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
                  { ShowOrders(stateProps.myCancelledDappEthOrders) }
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
                  {ShowOrders(stateProps.myCancelledEthDappOrders)}
                  </table>
                </Tab>
              </Tabs>              
            </Tab>
          </Tabs>
        </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      myTradedDappEthOrders: state.general.blockchain.myTradedDappEthOrders,
      myTradedEthDappOrders: state.general.blockchain.myTradedEthDappOrders,
      myFullfilledDappEthOrders: state.general.blockchain.myFullfilledDappEthOrders,
      myFullfilledEthDappOrders: state.general.blockchain.myFullfilledEthDappOrders,
      myCancelledDappEthOrders: state.general.blockchain.myCancelledDappEthOrders,
      myCancelledEthDappOrders: state.general.blockchain.myCancelledEthDappOrders
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

export default connect(mapStateToProps, mapDispatchToProps)(DappMyTransaction);
