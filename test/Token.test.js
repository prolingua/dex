import { tokens, EVM_REVERT } from './helpers'

const Token = artifacts.require('./Token')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, receiver, exchange]) => {
    const name = 'Dapp Token';
    const symbol = 'DAPP';
    const decimals = '18';
    const totalSupply = tokens(1000000);
    let token;

    beforeEach(async () => {
        token = await Token.new(exchange,totalSupply);
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            const result = await token.name();
            result.should.equal(name);
        })

        it('tracks the symbol', async ()  => {
            const result = await token.symbol()
            result.should.equal(symbol)
          })
      
          it('tracks the decimals', async ()  => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
          })
      
          it('tracks the total supply', async ()  => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())
          })
      
          it('assigns the total supply to the deployer', async ()  => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
          })
    })
    
    describe('sending token from', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = tokens(100);
        })

        describe('success', async () => {
            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, {from: exchange})
            })

            it('transfer from token balance from A to B', async () => {
                let balanceOf;
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());
            })

            it('emits a Transfer event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Transfer');
                const event = log.args;
                event.from.toString().should.equal(deployer, 'from is correct');
                event.to.toString().should.equal(receiver, 'to is correct');
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })

        describe('failure', async () => {

            it('rejects insufficient balances', async () => {
                let invalidAmount;
                invalidAmount = tokens(1000000000);
                await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange}).should.be.rejectedWith(EVM_REVERT);                
            })
            

            it('rejects invalid receipient', async() => {
                await token.transferFrom(deployer, 0x0, amount, {from: exchange }).should.be.rejected;
            })

            it('rejects invalid sender', async() => {
                await token.transferFrom(0x0, receiver, amount, {from: exchange }).should.be.rejected;
            })

            it('rejects invalid spender', async() => {
                await token.transferFrom(exchange, receiver, amount, {from: deployer}).should.be.rejected;
            })
        })
    })

})