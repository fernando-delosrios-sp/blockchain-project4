const { expectRevert } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

let app, data;

contract('Flight Surety Airline Tests', async (accounts) => {
    before('Setup contracts', async () => {
        app = await FlightSuretyApp.deployed();
        data = await FlightSuretyData.deployed();
        await data.registerAppContract(app.address);
        await app.registerDataContract(data.address);
    });

    it(`First airline was registered on contract deployment`, async function () {
        const firstAirline = accounts[1];
        const isAirline = await app.airline(firstAirline);

        assert.equal(isAirline, true, "First airline not registered on deployment");

    });

    it(`First airline cannot register new airlines until funded`, async function () {
        const firstAirline = accounts[1];
        const secondAirline = accounts[2];

        const isFunded = await app.funded(firstAirline);

        if (!isFunded) await expectRevert(app.registerAirline(secondAirline, { from: firstAirline }), "VM Exception while processing transaction: revert Address is not a funded airline -- Reason given: Address is not a funded airline.");
    });

    it(`First airline provides funds`, async function () {
        const sufficientFunds = await app.getAirlineFee();
        const insufficientFunds = sufficientFunds - ethers.utils.parseUnits('1', 'gwei');
        const firstAirline = accounts[1];

        await expectRevert(app.airlineDeposit({ value: insufficientFunds, from: firstAirline }), `VM Exception while processing transaction: revert Airlines must provide ${sufficientFunds} funding (${insufficientFunds}) -- Reason given: Airlines must provide ${sufficientFunds} funding (${insufficientFunds}).`);
        await app.airlineDeposit({ value: sufficientFunds, from: firstAirline });
        const isFunded = await app.funded(firstAirline);
        const funds = await web3.eth.getBalance(data.address);
        assert.equal(funds >= sufficientFunds, true, "Contract did not receive funds");
        assert.equal(isFunded, true, "First airline is not funded");
    });

    it(`First airline registers three other airlines and fifth gets queued`, async function () {
        const sufficientFunds = await app.getAirlineFee();
        const firstAirline = accounts[1];

        for (let i = 2; i < 5; i++) {
            await app.registerAirline(accounts[i], { from: firstAirline });
            const isAirline = await app.airline(accounts[i]);
            assert.equal(isAirline, true, `Airline ${i} was not registered`);
        }

        const fifthAirline = accounts[5];
        await app.registerAirline(fifthAirline, { from: firstAirline });

        const isSupporter = await app.supporter(fifthAirline, firstAirline);
        const isCandidate = await app.candidate(fifthAirline);
        const isAirline = await app.airline(fifthAirline);
        assert.equal(isSupporter, true, `Airline 1 is not a supporter of Airline 5`);
        assert.equal(isCandidate, true, `Airline 5 is not a candidate`);
        assert.equal(isAirline, false, `Airline 5 is a registered airline`);
    });

    it(`Second supporter airline registers fifth airline`, async function () {
        const secondAirline = accounts[2];
        const fifthAirline = accounts[5];

        const sufficientFunds = await app.getAirlineFee();
        await app.airlineDeposit({ value: sufficientFunds, from: secondAirline });
        await app.registerAirline(fifthAirline, { from: secondAirline });

        const isCandidate = await app.candidate(fifthAirline);
        const isAirline = await app.airline(fifthAirline);

        assert.equal(isAirline, true, `Airline 5 is not a registered airline`);
        assert.equal(isCandidate, false, `Airline 5 is a candidate`);
    });

});
