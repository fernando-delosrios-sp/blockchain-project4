const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const keccak256 = require('keccak256');
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;
const MIN_RESPONSES = 3;

let app, data;
const oracles = [];
const events = [];

async function getTransactionGasCost(receipt) {
    const transaction = await web3.eth.getTransaction(receipt.transactionHash);
    const amount = receipt.gasUsed;
    const price = transaction.gasPrice;

    return price * amount;
}

contract('Flight Surety Flight Tests', async (accounts) => {
    before('Setup contracts', async () => {
        app = await FlightSuretyApp.deployed();
        data = await FlightSuretyData.deployed();
        await data.registerAppContract(app.address);
        await app.registerDataContract(data.address);
    });

    it(`Fund two airlines`, async function () {
        const firstAirline = accounts[1];
        const secondAirline = accounts[2];
        const sufficientFunds = await app.getAirlineFee();

        await app.airlineDeposit({ value: sufficientFunds, from: firstAirline });
        await app.registerAirline(secondAirline, { from: firstAirline });
        await app.airlineDeposit({ value: sufficientFunds, from: secondAirline });

        const isFunded1 = await app.funded(firstAirline);
        assert.equal(isFunded1, true, "First airline is not funded");

        const isFunded2 = await app.funded(secondAirline);
        assert.equal(isFunded2, true, "Second airline is not funded");
    });

    it(`Register oracles`, async function () {
        const firstOracleIndex = 100;
        const oracleCount = 20;
        const oracleFee = await app.getOracleFee();
        const ORACLE = keccak256('ORACLE').hexSlice();

        for (let index = firstOracleIndex; index < firstOracleIndex + oracleCount; index++) {
            oracle = accounts[index];
            oracles.push(oracle);
            const receipt = await app.registerOracle({ value: oracleFee, from: oracle });
            const indexes = await app.getMyIndexes({ from: oracle });
            console.log(`${String(index - firstOracleIndex + 1).padStart(2, '0')}. ${oracle} indexes: ${indexes}`);
            await expectEvent.inTransaction(receipt.tx, FlightSuretyData, 'RoleGranted', { account: oracle });
        }
    });

    it(`Two airlines register two flights each`, async function () {
        const firstAirline = accounts[1];
        const secondAirline = accounts[2];
        const FLIGHT_TEMPLATE = 'NDXXX';

        for (let index = 1; index < 5; index++) {
            const flight = FLIGHT_TEMPLATE + index;
            const airline = index % 2 === 1 ? firstAirline : secondAirline;
            const timestamp = new Date().valueOf() * 1000;
            const receipt = await app.registerFlight(flight, timestamp, { from: airline });
            const key = await app.getFlightKey(airline, flight);
            const flightDetails = await app.getFlightDetails(key);
            assert.equal(flight, flightDetails[0], `Flight ${flight} not found`);
            expectEvent(receipt, 'OracleRequest', { flight });
        }
    });

    it(`Respond to oracle requests`, async function () {
        let pastEvents = await app.getPastEvents('OracleRequest', { fromBlock: 0, toBlock: 'latest' });
        const statuses = [STATUS_CODE_ON_TIME, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_AIRLINE];
        for (let event of pastEvents) {
            const { index, airline, flight, timestamp } = event.args;
            const statusCode = statuses.pop();
            let responses = 0;
            for (let oracle of oracles) {
                const indexes = await app.getMyIndexes({ from: oracle });
                if (indexes.map(x => x.toString()).includes(index.toString())) {
                    const receipt = await app.submitOracleResponse(airline, flight, timestamp, statusCode, { from: oracle });
                    expectEvent(receipt, 'OracleReport', { flight, status: statusCode.toString() });
                    console.log(`Oracle ${oracle} updated flight ${flight} with status ${statusCode}`);
                    responses++;
                    if (responses === MIN_RESPONSES) {
                        expectEvent(receipt, 'FlightStatusInfo', { flight, status: statusCode.toString() });
                        await expectRevert(app.submitOracleResponse(airline, flight, timestamp, statusCode, { from: oracle }), "VM Exception while processing transaction: revert Request already fulfilled -- Reason given: Request already fulfilled.");
                        break;
                    } else if (responses === 1) {
                        await expectRevert(app.submitOracleResponse(airline, flight, timestamp, statusCode, { from: oracle }), "VM Exception while processing transaction: revert Oracle already submitted response to request -- Reason given: Oracle already submitted response to request.");
                    }
                }
            }
        }
    });

    it(`Refund late flights`, async function () {
        const passenger = accounts[0];
        const fee = await app.getPassengerFee();
        let pastEvents = await app.getPastEvents('FlightStatusInfo', { fromBlock: 0, toBlock: 'latest' });
        for (let event of pastEvents) {
            const { airline, flight, status, timestamp } = event.args;
            if (status == STATUS_CODE_ON_TIME.toString()) {
                const key = await app.getFlightKey(airline, flight);
                await app.passengerDeposit(key, { value: fee, from: passenger });
                await expectRevert(app.passengerWithdraw(key, { from: passenger }), "VM Exception while processing transaction: revert Flight is not late for an insurance reimbursement -- Reason given: Flight is not late for an insurance reimbursement.");
            }
            else if (status == STATUS_CODE_LATE_TECHNICAL.toString()) {
                const key = await app.getFlightKey(airline, flight);
                await app.passengerDeposit(key, { value: fee, from: passenger });

                const initialBalance = await web3.eth.getBalance(passenger);
                const result = await app.passengerWithdraw(key, { from: passenger });
                const finalBalance = await web3.eth.getBalance(passenger);
                const gasCost = await getTransactionGasCost(result.receipt);
                // assert.equal(fee.toString(), (finalBalance - initialBalance + gasCost).toString(), "Passenger was not credited exact fee");
            } else if (status == STATUS_CODE_LATE_AIRLINE.toString()) {
                const bonusFee = fee * 3 / 2;
                const key = await app.getFlightKey(airline, flight);
                await app.passengerDeposit(key, { value: fee, from: passenger });
                const initialBalance = await web3.eth.getBalance(passenger);
                const status = await app.getFlightDetails(key);
                const result = await app.passengerWithdraw(key, { from: passenger });
                const finalBalance = await web3.eth.getBalance(passenger);
                const gasCost = await getTransactionGasCost(result.receipt);
                // assert.equal(bonusFee, finalBalance - initialBalance + gasCost, "Passenger was not credited 1.5 x fee");
            }
        }
    });

});