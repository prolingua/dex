const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function(deployer) {

    const accounts = await web3.eth.getAccounts();
    const feeAccount = accounts[0];
    const feePercent = 2;

    const exchange = await deployer.deploy(Exchange, feeAccount, feePercent);
    await deployer.deploy(Token, exchange.address);

};