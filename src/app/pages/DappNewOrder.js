import React from 'react';
import { connect } from 'react-redux';

import {Tabs, Tab } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

import actions from "actions";

import {tokens, ether, ETHER_ADDRESS} from '../../common/helpers';

const { creators } = actions;

async function makeDappEtherOrder(stateProps, dispatchProps){
  dispatchProps.changeState([
    { path:["blockchain", "startingMakingOrder"], value: true }
  ]);

  try {
    let amountGet = tokens(stateProps.tokenOrderAmount);
    let amountGive = ether(stateProps.etherOrderAmount);
    await stateProps.exchange.methods.makeOrder(stateProps.tokenAddress, amountGet, ETHER_ADDRESS, amountGive).send({from : stateProps.account });
  } catch(error){
    // do something here;
    console.log(error);
  }

  dispatchProps.changeState([
    { path:["blockchain", "startingMakingOrder"], value: false }
  ]);
}

async function makeEtherDappOrder(stateProps, dispatchProps){
  //alert('here2');
  dispatchProps.changeState([
    { path:["blockchain", "startingMakingOrder"], value: true }
  ]);

  try {
    let amountGet = ether(stateProps.etherOrderAmount);
    let amountGive = tokens(stateProps.tokenOrderAmount);
    await stateProps.exchange.methods.makeOrder(ETHER_ADDRESS, amountGet, stateProps.tokenAddress, amountGive).send({from : stateProps.account });
  } catch(error){
    // do something here;
    console.log(error);
  }

  dispatchProps.changeState([
    { path:["blockchain", "startingMakingOrder"], value: false }
  ]);
}


const NewOrderForm = ({stateProps, dispatchProps}) => {
  
  return (
    <Tabs defaultActiveKey="dapp-eth" className="bg-dark text-white">
      <Tab eventKey="dapp-eth" title="Dapp-Eth" className="bg-dark">
        <form onSubmit={(event) => {
            event.preventDefault();
            makeDappEtherOrder(stateProps, dispatchProps);
          }}>
          <br/>
          <div className="form-group small">
            <label>Dapp Quantity</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Dapp Quantity"
                onChange={(e) => 
                  {
                    dispatchProps.changeState([
                      {path: ["blockchain", "tokenOrderAmount"], value: e.target.value }
                  ]);                  
                  }
                }
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Ether Quantity</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Eth Quantity"
                onChange={(e) => 
                  {
                    dispatchProps.changeState([
                      {path: ["blockchain", "etherOrderAmount"], value: e.target.value }
                    ]);
                  }
                }
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm btn-block">Create Order</button>
        </form>
      </Tab>
      <Tab eventKey="eth-dapp" title="Eth-Dapp" className="bg-dark">
        <form onSubmit={(event) => {
          event.preventDefault();
          makeEtherDappOrder(stateProps, dispatchProps);
        }}>
        <br/>
        <div className="form-group small">
          <label>Eth Quantity</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder="Eth Quantity"
              onChange={(e) => 
                {
                  dispatchProps.changeState([
                    {path: ["blockchain", "etherOrderAmount"], value: e.target.value }
                  ]);
                }
              }
              required
            />
          </div>
        </div>
        <div className="form-group small">
          <label>Dapp Quantity</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder="Dapp Quantity"
              onChange={(e) => 
                {
                  dispatchProps.changeState([
                    {path: ["blockchain", "tokenOrderAmount"], value: e.target.value }
                  ]);
                }
              }
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm btn-block">Create Order</button>
      </form>

      </Tab>

    </Tabs>
  )
}

const DappNewOrder = ({ stateProps, dispatchProps }) => {
  return (
    <div className="card bg-dark text-white">
        <div className="card-header">
          Create Order
        </div>
        <div className="card-body">
        {!stateProps.startingMakingOrder ?  <NewOrderForm stateProps={stateProps} dispatchProps={dispatchProps} /> : <Spinner size="sm" animation="border" />}
        </div>
      </div>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      etherBalance: state.general.blockchain.etherBalance,
      exchangeEtherBalance: state.general.blockchain.exchangeEtherBalance,
      tokenBalance: state.general.blockchain.tokenBalance,
      exchangeTokenBalance: state.general.blockchain.exchangeTokenBalance,
      startingMakingOrder: state.general.blockchain.startingMakingOrder,
      tokenAddress: state.general.blockchain.tokenAddress,
      tokenOrderAmount: state.general.blockchain.tokenOrderAmount,
      etherOrderAmount: state.general.blockchain.etherOrderAmount,
      account: state.general.blockchain.account,
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

export default connect(mapStateToProps, mapDispatchToProps)(DappNewOrder);
