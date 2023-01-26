const ethers = require('ethers');
const Contract = require('@truffle/contract');
const FlightSuretyApp = require('./build/contracts/FlightSuretyApp.json');
const FlightSuretyData = require('./build/contracts/FlightSuretyData.json');
const truffleConfig = require('./truffle-config.js');
const fs = require('fs');

const init = async () => {
  const flights = ["A#010", "A#020", "A#030", "A#040", "A#050", "A#RND"];

  const setupAirline = async (supporter, target, fee) => {
    if (supporter.toLowerCase() != target.toLowerCase()) {
      const isAirline = await app.airline(target);
      if (!isAirline) {
        await app.registerAirline(target, { from: supporter });
        console.log(`Airline ${target} registered`);
      } else {
        console.log(`Airline ${target} already registered`);
      }
    }
    const isFunded = await app.funded(target);
    if (!isFunded) {
      await app.airlineDeposit({ from: target, value: fee });
      console.log(`Airline ${target} funded`);
    } else {
      console.log(`Airline ${target} already funded`);
    }
  }

  const setupOracle = async (oracle, fee) => {
    const isOracle = await app.oracle(oracle);
    if (!isOracle) {
      await app.registerOracle({ value: fee, from: oracle });
      console.log(`Oracle ${oracle} registered`);
    } else {
      console.log(`Oracle ${oracle} already registered`);
    }
    const indexes = await app.getMyIndexes({ from: oracle });
    return indexes.map(x => x.toNumber());
  }

  const respondFlightRequest = async (index, airline, flight, timestamp, event, indexes) => {
    try {
      let statusCode;
      // const { index, airline, flight, timestamp } = event.args;
      const regex = /A.0([0-9]{2})/;
      for (let [oracle, assigned] of Object.entries(indexes)) {
        if (regex.test(flight)) {
          statusCode = parseInt(regex.exec(flight)[1]);
        } else {
          statusCode = Math.floor(Math.random() * 5 + 1) * 10;
        }
        const oracleIndexes = indexes[oracle];
        if (oracleIndexes.includes(index)) {
          try {
            await app.submitOracleResponse(airline, flight, timestamp, statusCode, { from: oracle });
            console.log(`${oracle} submitted response ${statusCode} to ${flight} request`);
          } catch (error) {
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const FIRST_ORACLE_INDEX = 10
  const ORACLE_COUNT = 150
  let fee;
  const indexes = {};
  const responses = {};
  const network = truffleConfig.networks.development;
  // const { host, port } = network;
  // const wsProvider = new Web3.providers.WebsocketProvider(`ws://${host}:${port}`);
  const provider = network.provider();
  const url = 'ws://127.0.0.1:8545';
  const wsProvider = new ethers.providers.WebSocketProvider(url);
  const wallet = ethers.Wallet.fromMnemonic('woman assault home vault someone robot tray immense tennis usual visual joy');
  const signer = wallet.connect(wsProvider);

  const AIRLINE1 = provider.getAddress(1).toLowerCase();
  const AIRLINE2 = provider.getAddress(2).toLowerCase();
  const airlines = [AIRLINE1, AIRLINE2];



  const flightSuretyApp = Contract(FlightSuretyApp);
  await flightSuretyApp.setProvider(provider);
  const flightSuretyData = Contract(FlightSuretyData);
  await flightSuretyData.setProvider(provider);
  flightSuretyApp.defaults({
    from: provider.getAddress(0)
  })
  flightSuretyData.defaults({
    from: provider.getAddress(0)
  })

  let app = await flightSuretyApp.deployed();
  const data = await flightSuretyData.deployed();

  if (await app.paused()) {
    await data.registerAppContract(app.address);
    await app.registerDataContract(data.address);
  }

  const config = {
    address: app.address,
    airlines: {
      [AIRLINE1]:
      {
        address: AIRLINE1,
        name: "Airline 1"
      },
      [AIRLINE2]: {
        address: AIRLINE2,
        name: "Airline 2"
      }
    }
  };
  fs.writeFileSync('config.json', JSON.stringify(config, undefined, 2));

  fee = await app.getAirlineFee();
  await setupAirline(AIRLINE1, AIRLINE1, fee);
  await setupAirline(AIRLINE1, AIRLINE2, fee);

  fee = await app.getOracleFee();
  for (let i = FIRST_ORACLE_INDEX; i < FIRST_ORACLE_INDEX + ORACLE_COUNT; i++) {
    const oracle = provider.getAddress(i);
    const oracleIndexes = await setupOracle(oracle, fee);
    indexes[oracle] = oracleIndexes;
  }

  appEvents = new ethers.Contract(app.address, FlightSuretyApp.abi, signer);
  appEvents.on('FlightStatusInfo', (airline, flight, timestamp, status) => console.log(`STATUS INFO: ${flight} status set to ${status}`));
  appEvents.on('OracleReport', (airline, flight, timestamp, status) => console.log(`Report: ${flight} status reported as ${status}`));
  appEvents.on('OracleRequest', (index, airline, flight, timestamp, event) => respondFlightRequest(index, airline, flight, timestamp, event, indexes));

  for (let flight of flights) {
    let name, timestamp;
    timestamp = new Date().valueOf();
    for (i in airlines) {
      const index = parseInt(i) + 1;
      name = flight.replace('#', index);
      app.registerFlight(name, timestamp, { from: airlines[i] });
    }
  }

  // appEvents.queryFilter('OracleRequest', 0).then(x => x.forEach(f => respondFlightRequest(f, indexes)));
};

init();