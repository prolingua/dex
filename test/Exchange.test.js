import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helpers'

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require("./Token");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {   
    let exchange;
    let token;
    const feePercent = 10;

    beforeEach(async () => {
        exchange = await Exchange.new(feeAccount, feePercent);
        token = await Token.new(exchange.address);

    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount();
            result.should.equal(feeAccount);
        })

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        })
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing Ether', async () => {
        let result;
        let amount;
        let balance;

        beforeEach(async() => {
            amount = ether(1);
            result = await exchange.depositEther({from: user1, value: amount});
        })

        describe('success', () => {

            it('tracks the deposit', async () => {
                balance = await exchange.tokens(ETHER_ADDRESS,user1);
                balance.toString().should.equal(amount.toString());
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit');
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'token address is correct');
                event.user.toString().should.equal(user1.toString(), 'sender is correct');
                event.amount.toString().should.equal(amount.toString(), 'value is correct')
                event.balance.toString().should.equal(balance.toString(), 'balance is correct')
            })
        })
    })

    describe('withdrawing Ether', async () => {
        let result;
        let amount = ether(1);
        let balance;

        beforeEach(async() => {
            amount = ether(1);
            result = await exchange.depositEther({from: user1, value: amount});
        })

        describe('success', () => {

            beforeEach(async() => {
                result = await exchange.withdrawEther(amount, {from: user1});
            })

            it('tracks the remaining', async () => {
                balance = await exchange.tokens(ETHER_ADDRESS,user1);
                balance.toString().should.equal('0');
            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'token address is correct');
                event.user.toString().should.equal(user1.toString(), 'sender is correct');
                event.amount.toString().should.equal(amount.toString(), 'value is correct')
                event.balance.toString().should.equal(balance.toString(), 'balance is correct')
            })
        })

        describe('failure', () => {
            it('rejects withdraws for insufficient balances',  async () => {
                await exchange.withdrawEther(ether(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })                        
        })

    })

    describe('depositing token', () => {
        let result;
        let amount;
        let balance;

        beforeEach(async() => {
            amount = tokens(10);
            await token.transfer(user1, amount, {from: deployer})
        })

        describe('success', () => {

            beforeEach(async() => {
                await token.approve(exchange.address, amount, {from: user1});
                result = await exchange.depositToken(token.address, amount, {from: user1});
            })

            it('tracks the deposit', async () => {
                // Check exchange token balance
                balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());

                balance = await exchange.tokens(token.address,user1);
                balance.toString().should.equal(amount.toString());                
            })   
            
            it('emits a Deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit');
                const event = log.args;
                event.token.toString().should.equal(token.address.toString(), 'token address is correct');
                event.user.toString().should.equal(user1.toString(), 'sender is correct');
                event.amount.toString().should.equal(amount.toString(), 'value is correct')
                event.balance.toString().should.equal(balance.toString(), 'balance is correct')
            })
        })

        describe('failure', () => {

            it('fails when trying to deposit Token to ETHER address',  async () => {
                await exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })

            /* it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            }) */
            
        })
            
    })

    describe('withdrawing tokens', async() =>{
        let result;
        let amount;
        let balance;

        beforeEach(async() => {
            amount = tokens(10);
            await token.transfer(user1, amount, {from: deployer});
            await token.approve(exchange.address, amount, {from: user1});
            await exchange.depositToken(token.address, amount, {from: user1});            
        })

        describe('success', async() => {
            beforeEach(async () => {
                result = await exchange.withdrawToken(token.address, tokens(5), {from: user1});
                //balance = await exchange.tokens(token.address, user1);
                balance = await exchange.balanceOf(token.address, user1);
            })

            it('tracks the remaining token', async () => {
                balance.toString().should.be.equal(tokens(5).toString());
            })

            it('emits a Withdraw event', async () => {            
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(token.address.toString(), 'token address is correct');
                event.user.toString().should.equal(user1.toString(), 'sender is correct');
                event.amount.toString().should.equal(tokens(5).toString(), 'value is correct')
                event.balance.toString().should.equal(balance.toString(), 'balance is correct')
            })
        })

        describe('failure', async() => {
            it('rejects Ether withdraw', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(5), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })

            it('fails for insufficient balances', async () => {
                await exchange.withdrawToken(token.address, tokens(15), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })
        })       
    })

    describe('making orders', async () => {
        let result;

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from : user1})
        })

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount();
            orderCount.toString().should.equal('1');

            const order = await exchange.orders(orderCount);
            order.user.should.equal(user1);
        })

        it('emits an Order event', async () => {
            const log = result.logs[0];
            log.event.should.equal('Order');
            const event = log.args;
            event.id.toString().should.equal('1');
            event.user.should.equal(user1);
            event.tokenGet.should.equal(token.address);
            event.amountGet.toString().should.equal(tokens(1).toString());
            event.tokenGive.should.equal(ETHER_ADDRESS);
            event.amountGive.toString().should.equal(ether(1).toString());
            event.timestamp.toString().length.should.at.least(1);
        })
    })

    describe('order actions', async() => {
        beforeEach(async () => {
            await exchange.depositEther({from:user1, value: ether(1)});
            await token.transfer(user2, tokens(100), {from: deployer});
            
            await token.approve(exchange.address, tokens(2), {from: user2});
            await exchange.depositToken(token.address, tokens(2), { from: user2});

            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1});
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: deployer});
        })

        describe('cancelling order', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', {from : user1 })
                })

                it('updates cancelled orders', async () => {
                    const cancelledOrder = await exchange.cancelledOrders(1);
                    cancelledOrder.should.equal(true);
                })
                
                it('emits a Cancel event', async () => {
                    const log = result.logs[0];
                    log.event.should.equal('Cancel');
                    const event = log.args;
                    event.id.toString().should.equal('1');
                    event.user.should.equal(user1);
                    event.tokenGet.should.equal(token.address);
                    event.amountGet.toString().should.equal(tokens(1).toString());
                    event.tokenGive.should.equal(ETHER_ADDRESS);
                    event.amountGive.toString().should.equal(ether(1).toString());
                    event.timestamp.toString().length.should.at.least(1);
                })
            })

            describe('failure',  async() => {
                it('rejects cancelling not existent order', async () => {
                    await exchange.cancelOrder('4', {from : user1 }).should.be.rejectedWith(EVM_REVERT);
                })

                it('rejects cancelling order not belonging to the canceller', async () => {
                    await exchange.cancelOrder('2', {from : user1 }).should.be.rejectedWith(EVM_REVERT);
                })
            })
        })

        describe('filling order', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.fillOrder('1', {from: user2 });
                })

                it('executes the trade & charges fees', async () => {
                    let balance;
                    
                    balance = await exchange.tokens(token.address, user1);
                    balance.toString().should.equal(tokens(1).toString());

                    balance = await exchange.tokens(token.address, feeAccount);
                    balance.toString().should.equal(tokens(0.1).toString());

                    balance = await exchange.tokens(token.address, user2);
                    balance.toString().should.equal(tokens(0.9).toString());

                    balance = await exchange.tokens(ETHER_ADDRESS, user1);
                    balance.toString().should.equal(ether(0).toString());

                    balance = await exchange.tokens(ETHER_ADDRESS, user2);
                    balance.toString().should.equal(ether(1).toString());

                })

                it('updates filled orders', async() => {
                    const filledOrder = await exchange.filledOrders(1);
                    filledOrder.should.equal(true);
                })

                it('emits a Trade event', async() => {
                    const log = result.logs[0];
                    log.event.should.equal('Trade');
                    const event = log.args;
                    event.id.toString().should.equal('1');
                    event.user.should.equal(user1);
                    event.tokenGet.should.equal(token.address);
                    event.amountGet.toString().should.equal(tokens(1).toString());
                    event.tokenGive.should.equal(ETHER_ADDRESS);
                    event.amountGive.toString().should.equal(ether(1).toString());
                    event.fillingUser.should.equal(user2);
                    event.timestamp.toString().length.should.at.least(1);
                })
            })

            describe('failure', async () => {
                it('rejects filling not existent order', async () => {
                    await exchange.fillOrder(3, {from : user2}).should.be.rejectedWith(EVM_REVERT);
                })

                it('rejects filling its own order', async () => {
                    await exchange.fillOrder('1', {from: user1}).should.be.rejectedWith(EVM_REVERT);
                })

                it('rejects filling cancelled order', async () => {
                    await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled;
                    await exchange.fillOrder('1', {from : user2}).should.be.rejectedWith(EVM_REVERT);
                })

                it('rejects filling filled order', async () => {
                    await exchange.fillOrder('1', {from: user2}).should.be.fulfilled;
                    await exchange.fillOrder('1', {from : user2}).should.be.rejectedWith(EVM_REVERT);
                })                

            })
        })
    })
})