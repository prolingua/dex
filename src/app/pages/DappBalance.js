import React from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

import actions from "actions";

import {tokens, ether} from '../../common/helpers';

const { creators } = actions;


async function depositToken(stateProps, dispatchProps) {
    dispatchProps.changeState([
        { path:["blockchain", "startingDepositing"], value: true }
    ]);

    if(stateProps.tokenDepositAmount > stateProps.tokenBalance/(10**18)){
        dispatchProps.changeState([
            { path:["blockchain", "startingDepositing"], value: false },
            { path: ["modal", "open"], value: true },
            { path: ["modal","content"], value: "InfoDialog"},
            { path: ["modal", "header"], value: "Error"},
            { path: ["modal", "body"], value: `You don't have enough Dapp in the wallet to deposit.`}
        ]);
        return;
    }

    try {
        let amount = tokens(stateProps.tokenDepositAmount);
        await stateProps.exchange.methods.depositToken(stateProps.tokenAddress, tokens(stateProps.tokenDepositAmount)).send({from : stateProps.account });
    } catch(error){
        // do something here;
        console.log(error);
    }

    dispatchProps.changeState([
        { path:["blockchain", "startingDepositing"], value: false }
    ]);    
}

async function depositEther(stateProps, dispatchProps) {
    dispatchProps.changeState([
        { path:["blockchain", "startingDepositing"], value: true }
    ]);

    if(stateProps.etherDepositAmount > stateProps.etherBalance/(10**18)){
        dispatchProps.changeState([
            { path:["blockchain", "startingDepositing"], value: false },
            { path: ["modal", "open"], value: true },
            { path: ["modal","content"], value: "InfoDialog"},
            { path: ["modal", "header"], value: "Error"},
            { path: ["modal", "body"], value: `You don't have enough Eth in the wallet to deposit.`}
        ]);
        return;
    }

    try {
        let amount = ether(stateProps.etherDepositAmount);
        await stateProps.exchange.methods.depositEther().send({from : stateProps.account, value: amount });
    } catch(error){
        // do something here;
    }

    dispatchProps.changeState([
        { path:["blockchain", "startingDepositing"], value: false }
    ]);    
}

async function withdrawToken(stateProps, dispatchProps){
    
    dispatchProps.changeState([
        { path:["blockchain", "startingWithdrawing"], value: true }
    ]);

    if(stateProps.tokenWithdrawAmount > stateProps.exchangeTokenBalance/(10**18)){
        dispatchProps.changeState([
            { path:["blockchain", "startingWithdrawing"], value: false },
            { path: ["modal", "open"], value: true },
            { path: ["modal","content"], value: "InfoDialog"},
            { path: ["modal", "header"], value: "Error"},
            { path: ["modal", "body"], value: `You don't have enough Dapp in the exchange to withdraw.`}
        ]);
        return;
    }

    try{
        let amount = tokens(stateProps.tokenWithdrawAmount);
        await stateProps.exchange.methods.withdrawToken(stateProps.tokenAddress, amount).send({from: stateProps.account})
    } catch(error){
        // do something here;
        console.log(error);
    }
    dispatchProps.changeState([
        { path:["blockchain", "startingWithdrawing"], value: false }
    ]);
}

async function withdrawEther(stateProps, dispatchProps){
    
    dispatchProps.changeState([
        { path:["blockchain", "startingWithdrawing"], value: true }
    ]);

    if(stateProps.etherWithdrawAmount > stateProps.exchangeEtherBalance/(10**18)){
        dispatchProps.changeState([
            { path:["blockchain", "startingWithdrawing"], value: false },
            { path: ["modal", "open"], value: true },
            { path: ["modal","content"], value: "InfoDialog"},
            { path: ["modal", "header"], value: "Error"},
            { path: ["modal", "body"], value: `You don't have enough Eth in the exchange to withdraw.`}
        ]);
        return;
    }

    try{
        let amount = ether(stateProps.etherWithdrawAmount);
        await stateProps.exchange.methods.withdrawEther(amount).send({from: stateProps.account});
    } catch(error){

    }
    dispatchProps.changeState([
        { path:["blockchain", "startingWithdrawing"], value: false }
    ]);
}

async function sendDapp(stateProps, dispatchProps){

    dispatchProps.changeState([
        { path:["blockchain", "startingSendingDapp"], value: true }
    ]);

    if(stateProps.tokenBalance < stateProps.tokenSendAmount/(10**18)){
        dispatchProps.changeState([
            { path:["blockchain", "startingSendingDapp"], value: false },
            { path: ["modal", "open"], value: true },
            { path: ["modal","content"], value: "InfoDialog"},
            { path: ["modal", "header"], value: "Error"},
            { path: ["modal", "body"], value: `You don't have enough Dapp in the wallet to send.`}
        ]);
        return;
    }

    try{
        console.log(stateProps.tokenSendAmount);
        console.log(stateProps.dappRecipientAddress);
        let amount = tokens(stateProps.tokenSendAmount);        
        await stateProps.token.methods.transfer(stateProps.dappRecipientAddress, amount).send({from: stateProps.account});
    } catch(error){
        console.log(error);
    }
    dispatchProps.changeState([
        { path:["blockchain", "startingSendingDapp"], value: false }
    ]);

}
const DappBalance = ({ stateProps, dispatchProps }) => {
  return (
    <div className="card bg-dark text-white">
        <div className="card-header">
            Balance
        </div>
        <div className="card-body">
            {!stateProps.balanceLoading ?  <BalanceForm stateProps={stateProps} dispatchProps={dispatchProps} /> : <Spinner size="sm" animation="border" />}
        </div>
    </div>
  );
}

const BalanceForm = ({stateProps,dispatchProps}) => {
    return (
        <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
        <Tab eventKey="deposit" title="Deposit" className="bg-dark">
            <table className="table table-dark table-sm small">
                <thead>
                    <tr>
                        <td>Token</td>
                        <td align="right">Wallet</td>
                        <td align="right">Exchange</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ETH</td>
                        <td align="right">{(stateProps.etherBalance/(10**18)).toFixed(4)}</td>
                        <td align="right">{(stateProps.exchangeEtherBalance/(10**18)).toFixed(4)}</td>
                    </tr>
                    <tr>
                        <td>DAPP</td>
                        <td align="right">{(stateProps.tokenBalance/(10**18)).toFixed(4)}</td>
                        <td align="right" >{(stateProps.exchangeTokenBalance/(10**18)).toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
            {stateProps.startingDepositing ? <Spinner size="sm" animation="border"/> :
            <div>
            <div>Deposit Ether</div>
            <form className="row" onSubmit={(event) => {
                event.preventDefault();
                depositEther(stateProps, dispatchProps);
                }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                        type="text"
                        placeholder="ETH Amount"
                        onChange={(e) => {
                            dispatchProps.changeState([
                                {path: ["blockchain", "etherDepositAmount"], value: e.target.value }
                            ]);
                            }
                        }
                        className="form-control form-control-sm bg-dark text-white"
                        required />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                </div>
            </form>
            <br/>
            <div>Deposit Dapp</div>            
            <form className="row" onSubmit={(event) => {
                    event.preventDefault()
                    depositToken(stateProps, dispatchProps)
                    }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                        type="text"
                        placeholder="DAPP Amount"
                        onChange={(e) =>  {
                                dispatchProps.changeState([
                                    {path: ["blockchain", "tokenDepositAmount"], value: e.target.value }
                                ]);
                            }
                        }
                        className="form-control form-control-sm bg-dark text-white"
                        required />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                </div>
            </form>
            </div>
            }
        </Tab>
        <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
            <table className="table table-dark table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <td align="right">Wallet</td>
                        <td align="right">Exchange</td>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td>ETH</td>
                    <td align="right">{(stateProps.etherBalance/(10**18)).toFixed(4)}</td>
                    <td align="right">{(stateProps.exchangeEtherBalance/(10**18)).toFixed(4)}</td>
                </tr>
                <tr>
                    <td>DAPP</td>
                        <td align="right">{(stateProps.tokenBalance/(10**18)).toFixed(4)}</td>
                        <td align="right">{(stateProps.exchangeTokenBalance/(10**18)).toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
            {stateProps.startingWithdrawing ? <Spinner size="sm" animation="border"/> : 
            <div>            
            <div>Withdraw Ether</div>
            <form className="row" onSubmit={(event) => {
                    event.preventDefault();
                    withdrawEther(stateProps, dispatchProps)
                 }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                        type="text"
                        placeholder="ETH Amount"
                        onChange={(e) => 
                            {
                                dispatchProps.changeState([
                                    {path: ["blockchain", "etherWithdrawAmount"], value: e.target.value }
                                ]);
                            }
                        }
                        className="form-control form-control-sm bg-dark text-white"
                        required />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                </div>
            </form>
            <br/>
            <div>Withdraw Dapp</div>
            <form className="row" onSubmit={(event) => {
                    event.preventDefault();
                    withdrawToken(stateProps, dispatchProps);
                }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                        type="text"
                        placeholder="DAPP Amount"
                        onChange={(e) => 
                            {
                                dispatchProps.changeState([
                                    {path: ["blockchain", "tokenWithdrawAmount"], value: e.target.value }
                                ]);
                            }
                        }
                        className="form-control form-control-sm bg-dark text-white"
                        required />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                </div>
            </form>
            </div>}
        </Tab>
        <Tab eventKey="senddapp" title="Send Dapp" className="bg=dark">
            <table className="table table-dark table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <td align="right">Wallet</td>
                        <td align="right">Exchange</td>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td>ETH</td>
                    <td align="right">{(stateProps.etherBalance/(10**18)).toFixed(4)}</td>
                    <td align="right">{(stateProps.exchangeEtherBalance/(10**18)).toFixed(4)}</td>
                </tr>
                <tr>
                    <td>DAPP</td>
                        <td align="right">{(stateProps.tokenBalance/(10**18)).toFixed(4)}</td>
                        <td align="right">{(stateProps.exchangeTokenBalance/(10**18)).toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
            {stateProps.startingSendingDapp ? <Spinner size="sm" animation="border"/> : 
            
            <div>
            <form onSubmit={(event) => {
                event.preventDefault();
                sendDapp(stateProps, dispatchProps);
                }} > 
                <div className="form-group small">
                    <label>Amount to send</label>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Dapp amount to send"
                            onChange={(e) => {
                                dispatchProps.changeState([
                                    {path: ["blockchain", "tokenSendAmount"], value: e.target.value }
                                ]);
                            }}
                            className="form-control form-control-sm bg-dark text-white"
                            required
                        >
                        </input>
                    </div>
                </div>
                <div className="form-group small">
                    <label>Recipient Address</label>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            onChange={(e) => {
                            dispatchProps.changeState([
                                    {path: ["blockchain", "dappRecipientAddress"], value: e.target.value }
                                ]);
                            }}
                            className="form-control form-control-sm bg-dark text-white"
                            required>
                        </input>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-sm">Send</button>
            </form>            
            
            </div>
            }
        </Tab>
    </Tabs>
    )
}
function mapStateToProps(state) {
  return {
    stateProps: {
        etherBalance: state.general.blockchain.etherBalance,
        exchangeEtherBalance: state.general.blockchain.exchangeEtherBalance,
        balanceLoading: state.general.blockchain.balanceLoading,
        tokenBalance: state.general.blockchain.tokenBalance,
        exchangeTokenBalance: state.general.blockchain.exchangeTokenBalance,
        token: state.general.blockchain.token,
        exchange:state.general.blockchain.exchange,
        account: state.general.blockchain.account,
        exchangeAddress: state.general.blockchain.exchangeAddress,
        tokenAddress: state.general.blockchain.tokenAddress,
        tokenDepositAmount: state.general.blockchain.tokenDepositAmount,
        etherDepositAmount: state.general.blockchain.etherDepositAmount,
        tokenWithdrawAmount: state.general.blockchain.tokenWithdrawAmount,
        etherWithdrawAmount : state.general.blockchain.etherWithdrawAmount,
        startingDepositing: state.general.blockchain.startingDepositing,
        startingWithdrawing: state.general.blockchain.startingWithdrawing,
        dappRecipientAddress: state.general.blockchain.dappRecipientAddress,
        tokenSendAmount: state.general.blockchain.tokenSendAmount,
        startingSendingDapp: state.general.blockchain.startingSendingDapp
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {
      changeState: (items) => {
        dispatch(creators.changeState({ items }));
      },
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DappBalance);
