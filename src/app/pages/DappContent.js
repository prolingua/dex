import React from "react";
import { connect } from "react-redux";
import actions from "actions";
import Web3 from 'web3';

import DappBalance from './DappBalance';
import DappNewOrder from './DappNewOrder';
import DappOrderBook from './DappOrderBook';
import DappMyOpenOrder from './DappMyOpenOrder';
import DappMyTransactions from './DappMyTransaction';
import DappTrades from './DappTrades';

const { creators } = actions;

const DappContent = ({ stateProps, dispatchProps }) => {    

    return(
      <div className="content">
        <div className="vertical-split">
            <DappBalance />
            <DappNewOrder />
        </div>
        <DappTrades />
        <DappOrderBook />
        <DappMyOpenOrder />
        <DappMyTransactions />
      </div>
    )
}

function mapStateToProps(state) {
    return {
      stateProps: {
        
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(DappContent);
  