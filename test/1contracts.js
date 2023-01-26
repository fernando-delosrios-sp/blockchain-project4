const { expectRevert } = require('@openzeppelin/test-helpers');
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

let app, data;

contract('Flight Surety Functional Tests', async (accounts) => {
    before('Setup contracts', async () => {
        app = await FlightSuretyApp.deployed();
        data = await FlightSuretyData.deployed();
        await data.registerAppContract(app.address);
        await app.registerDataContract(data.address);
    });

    it(`Contracts are correctly bound`, async function () {
        const appAddress = app.address;
        const dataAddress = data.address;
        console.log("App: ", appAddress);
        console.log("Data: ", dataAddress);
        const registeredAppAddress = await data.getAppAddress();
        const registeredDataAddress = await app.getDataAddress();

        assert.equal(appAddress, registeredAppAddress, "Registered app address does not match");
        assert.equal(dataAddress, registeredDataAddress, "Registered data address does not match");
    });

    it(`Operability checks`, async function () {
        await app.pause();
        await expectRevert(app.getAirlineFee(), "VM Exception while processing transaction: revert Pausable: paused");
    });

    it(`Accessibility checks`, async function () {
        await app.unpause();
        const isAdmin = await data.admin(app.address);
        assert.equal(isAdmin, true, "App is not data admin");
    });
});