const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");
const ether = n => {
    return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
    )
  }
const tokens = (n) => ether(n);

module.exports = async function(deployer) {

    const accounts = await web3.eth.getAccounts();
    const feeAccount = accounts[0];
    const feePercent = 2;
    const totalSupply = tokens(1000000);

    const exchange = await deployer.deploy(Exchange, feeAccount, feePercent);
    const token = await deployer.deploy(Token, exchange.address,  totalSupply);
    await token.approve(exchange.address,  totalSupply);

};