// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp is Ownable, Pausable, ReentrancyGuard {
    // using SafeMath for uint256; DEPRECATED in Solidity 0.8

    //region Constants and variables
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    uint256 private AIRLINE_FEE = 10 ether;
    uint256 public constant REGISTRATION_FEE = 1 ether;
    uint256 private constant PASSENGER_MAX_INSURANCE = 1 ether;
    uint256 private constant MIN_RESPONSES = 3;
    uint8 private nonce = 0;
    bytes32 public constant AIRLINE = keccak256("AIRLINE");
    bytes32 public constant FUNDED = keccak256("FUNDED");
    bytes32 public constant CANDIDATE = keccak256("CANDIDATE");
    bytes32 public constant ORACLE = keccak256("ORACLE");

    FlightSuretyData private data;
    //endregion

    //region Events
    event FlightStatusInfo(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status,
        bytes32 flightKey
    );

    event OracleReport(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    event OracleRequest(
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp
    );

    //endregion

    //region Init
    constructor() Ownable() Pausable() ReentrancyGuard() {
        _pause();
    }

    function registerDataContract(address dataAddress) public onlyOwner {
        data = FlightSuretyData(payable(dataAddress));
        require(
            address(this) == data.getAppAddress(),
            "Please register app on data contract first"
        );
        if (paused()) {
            _unpause();
        }
    }

    //endregion

    //region Modifiers
    modifier isAirline() {
        require(airline(msg.sender), "Address is not a registered airline");
        _;
    }

    modifier isOracle() {
        require(oracle(msg.sender), "Address is not a registered oracle");
        _;
    }

    modifier isFunded() {
        require(funded(msg.sender), "Address is not a funded airline");
        _;
    }

    modifier isNotFunded() {
        require(!funded(msg.sender), "Address is a funded airline");
        _;
    }

    modifier scheduledAhead(uint256 timestamp) {
        require(
            timestamp > block.timestamp,
            "Flight schedule must be a future date"
        );
        _;
    }

    modifier passengerDepositPending(bytes32 flightKey) {
        require(
            passengerFees(flightKey, _msgSender()) > 0,
            "Address already paid insurance"
        );
        _;
    }

    modifier sufficientOracleDeposit() {
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");
        _;
    }

    modifier sufficientAirlineDeposit() {
        require(
            msg.value >= AIRLINE_FEE,
            string(
                abi.encodePacked(
                    "Airlines must provide ",
                    Strings.toString(AIRLINE_FEE),
                    " funding (",
                    Strings.toString(msg.value),
                    ")"
                )
            )
        );
        _;
    }

    modifier matchingIndex(uint8 index) {
        uint8[3] memory indexes = getMyIndexes();
        require(
            (indexes[0] == index) ||
                (indexes[1] == index) ||
                (indexes[2] == index),
            "Index does not match oracle request"
        );
        _;
    }

    // endregion

    //region Checks
    function supporter(address candidateAddress, address supporterAddress)
        public
        view
        returns (bool)
    {
        bytes32 candidateRole = _candidateRole(candidateAddress);
        return data.hasRole(candidateRole, supporterAddress);
    }

    function candidate(address airlineAddress) public view returns (bool) {
        return data.hasRole(CANDIDATE, airlineAddress);
    }

    function airline(address airlineAddress) public view returns (bool) {
        return data.hasRole(AIRLINE, airlineAddress);
    }

    function funded(address airlineAddress) public view returns (bool) {
        return data.hasRole(FUNDED, airlineAddress);
    }

    function oracle(address oracleAddress) public view returns (bool) {
        return data.hasRole(ORACLE, oracleAddress);
    }

    function oracleFees(address addr)
        external
        view
        onlyOwner
        returns (uint256)
    {
        return data.oracleFees(addr);
    }

    function passengerFees(bytes32 flightKey, address addr)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return data.passengerFees(flightKey, addr);
    }

    //endregion

    //region Utils
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getAirlineCount() external view returns (uint256) {
        return data.getRoleMemberCount(AIRLINE);
    }

    function getDataAddress() external view returns (address) {
        return address(data);
    }

    function _candidateRole(address addr) private pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }

    function generateIndexes(address addr) internal returns (uint8[3] memory) {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(addr);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(addr);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(addr);
        }

        return indexes;
    }

    function getRandomIndex(address addr) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(
            uint256(keccak256(abi.encodePacked(++nonce, addr))) % maxValue
        );
        // THROWS RANDOM ERRORS FOR SOME REASON
        // uint8 random = uint8(
        //     uint256(
        //         keccak256(
        //             abi.encodePacked(blockhash(block.number - ++nonce), addr)
        //         )
        //     ) % maxValue
        // );

        if (nonce > 250) {
            nonce = 0; // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    function getMyIndexes() public view isOracle returns (uint8[3] memory) {
        return data.getOracleIndexes(_msgSender());
    }

    function getOracleFee() public pure returns (uint256) {
        return REGISTRATION_FEE;
    }

    function getPassengerFee() public pure returns (uint256) {
        return PASSENGER_MAX_INSURANCE;
    }

    function getFlightKey(address addr, string calldata flight)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(addr, flight));
    }

    function getRequestKey(
        address addr,
        string calldata flight,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(addr, flight, timestamp));
    }

    function getFlightStatus(bytes32 key) public view returns (uint8) {
        return data.getFlightStatus(key);
    }

    function lateFlight(uint8 status) public pure returns (bool) {
        return status != STATUS_CODE_ON_TIME && status != STATUS_CODE_UNKNOWN;
    }

    function getFlightDetails(bytes32 key)
        public
        view
        returns (
            string memory,
            uint8,
            uint256,
            address
        )
    {
        return data.getFlightDetails(key);
    }

    function requestPending(bytes32 key) public view returns (bool) {
        return data.requestPending(key);
    }

    //endregion

    //region Business logic
    function getAirlineFee()
        external
        view
        onlyOwner
        whenNotPaused
        returns (uint256)
    {
        return data.getAirlineFee();
    }

    function setAirlineFee(uint256 fee) external onlyOwner whenNotPaused {
        data.setAirlineFee(fee);
    }

    function registerAirline(address addr)
        external
        isFunded
        whenNotPaused
        nonReentrant
    {
        uint256 airlineCount = data.getRoleMemberCount(AIRLINE);
        if (airlineCount < 4) {
            data.grantRole(AIRLINE, addr);
        } else {
            data.grantRole(CANDIDATE, addr);
            bytes32 candidateRole = _candidateRole(addr);
            data.grantRole(candidateRole, _msgSender());
            uint256 supportersCount = data.getRoleMemberCount(candidateRole);
            uint256 support = (supportersCount * 100) / airlineCount;
            if (support >= 50) {
                data.grantRole(AIRLINE, addr);
                data.revokeRole(CANDIDATE, addr);
            }
        }
    }

    function registerFlight(string calldata flight, uint256 timestamp)
        external
        whenNotPaused
        isFunded
        scheduledAhead(timestamp)
    {
        bytes32 key = getFlightKey(_msgSender(), flight);
        data.registerFlight(
            key,
            flight,
            _msgSender(),
            STATUS_CODE_UNKNOWN,
            timestamp
        );

        fetchFlightStatus(_msgSender(), flight, timestamp);
    }

    //endregion

    //region Oracles
    function fetchFlightStatus(
        address addr,
        string calldata flight,
        uint256 timestamp
    ) public {
        uint8 index = getRandomIndex(_msgSender());
        bytes32 requestKey = getRequestKey(addr, flight, timestamp);
        bytes32 flightKey = getFlightKey(addr, flight);
        data.registerRequest(requestKey, flightKey, index);

        emit OracleRequest(index, addr, flight, timestamp);
    }

    function registerOracle() external payable sufficientOracleDeposit {
        uint8[3] memory indexes = generateIndexes(_msgSender());
        data.registerOracle(_msgSender(), indexes);
        uint256 change = msg.value - REGISTRATION_FEE;
        if (change > 0) {
            data.oracleDeposit{value: REGISTRATION_FEE}(_msgSender());
            payable(_msgSender()).transfer(change);
        } else {
            data.oracleDeposit{value: msg.value}(_msgSender());
        }
    }

    function submitOracleResponse(
        address airlineAddress,
        string calldata flight,
        uint256 requestTimestamp,
        uint8 statusCode
    ) external {
        bytes32 requestKey = getRequestKey(
            airlineAddress,
            flight,
            requestTimestamp
        );
        bytes32 flightKey = getFlightKey(airlineAddress, flight);
        uint8 responses = data.submitOracleResponse(
            _msgSender(),
            requestKey,
            statusCode
        );
        emit OracleReport(airlineAddress, flight, requestTimestamp, statusCode);
        if (responses >= MIN_RESPONSES) {
            data.updateFlightStatus(requestKey, statusCode);
            emit FlightStatusInfo(
                airlineAddress,
                flight,
                block.timestamp,
                statusCode,
                flightKey
            );
        }
    }

    //endregion

    //region Payments
    function passengerDeposit(bytes32 flightKey)
        public
        payable
        whenNotPaused
        nonReentrant
    {
        uint256 change = msg.value - PASSENGER_MAX_INSURANCE;
        if (change > 0) {
            data.passengerDeposit{value: PASSENGER_MAX_INSURANCE}(
                flightKey,
                _msgSender()
            );
            payable(_msgSender()).transfer(change);
        } else {
            data.passengerDeposit{value: msg.value}(flightKey, _msgSender());
        }
    }

    function passengerWithdraw(bytes32 flightKey)
        external
        whenNotPaused
        nonReentrant
    {
        uint8 status = getFlightStatus(flightKey);
        require(
            lateFlight(status),
            "Flight is not late for an insurance reimbursement"
        );
        if (status == STATUS_CODE_LATE_AIRLINE) {
            data.passengerPayBonus(flightKey, _msgSender());
        }
        data.passengerWithdraw(flightKey, _msgSender());
    }

    function airlineDeposit()
        public
        payable
        nonReentrant
        isAirline
        isNotFunded
        sufficientAirlineDeposit
    {
        data.grantRole(FUNDED, _msgSender());
        data.airlineDeposit{value: AIRLINE_FEE}(_msgSender());
        uint256 change = msg.value - AIRLINE_FEE;
        if (change > 0) {
            payable(_msgSender()).transfer(change);
        }
    }
    //endregion
}
