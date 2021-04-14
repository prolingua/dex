# dex
You have to have NodeJS, truffle, ganache installed
First install all the dependencies : npm install

To compile the smart contracts: truffle compile

To test the smart contracts: truffle test

To deploy the smart contracts: truffle migrate; You need to have Ganache

To run the seed script: truffle exec scripts/seed-exchange.js; You have to do this immediately after deploying the smart contracts

To run the front end: npm start; You need to have Ganache run and Metamask installed

The smart contract Exchange.sol doesn't have NatSpec comments. You can add them