const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(FlightSuretyApp);
    await deployer.deploy(FlightSuretyData, accounts[1]);
}