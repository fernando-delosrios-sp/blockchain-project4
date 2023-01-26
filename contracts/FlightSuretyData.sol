// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";

contract FlightSuretyData is Ownable, Pausable, AccessControlEnumerable {
    // using SafeMath for uint256; DEPRECATED in Solidity 0.8

    //region Constants and variables
    Escrow private oracleEscrow;
    uint256 private AIRLINE_FEE = 10 ether;
    uint256 private PASSENGER_MAX_INSURANCE = 1 ether;
    bytes32 public constant AIRLINE = keccak256("AIRLINE");
    bytes32 public constant FUNDED = keccak256("FUNDED");
    bytes32 public constant CANDIDATE = keccak256("CANDIDATE");
    bytes32 public constant ORACLE = keccak256("ORACLE");
    address private app;
    struct Flight {
        string flight;
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airlineAddress;
    }
    struct ResponseInfo {
        bytes32 flightKey;
        uint8 index;
        mapping(uint8 => address[]) responses;
        mapping(address => bool) participants;
        bool pending;
    }
    mapping(bytes32 => Flight) private flights;
    mapping(bytes32 => Escrow) private insurances;
    mapping(bytes32 => ResponseInfo) private requests;
    mapping(bytes32 => bool) private insuranceRegistration;
    mapping(address => uint8[3]) private oracles;

    //endregion

    //region Init
    constructor(address addr) Ownable() Pausable() {
        oracleEscrow = new Escrow();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(AIRLINE, addr);
    }

    function registerAppContract(address appAddress) external onlyOwner {
        _setupRole(DEFAULT_ADMIN_ROLE, appAddress);
        app = appAddress;
    }

    //endregion

    //region Modifiers
    modifier onlyApp() {
        require(app == _msgSender(), "Caller contract not registered");
        _;
    }

    //endregion

    //region Checks
    function admin(address addr) external view whenNotPaused returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, addr);
    }

    function getAppAddress() public view whenNotPaused returns (address) {
        return app;
    }

    function oracleFees(address addr)
        external
        view
        onlyApp
        whenNotPaused
        returns (uint256)
    {
        return oracleEscrow.depositsOf(addr);
    }

    function passengerFees(bytes32 flightKey, address addr)
        external
        view
        onlyApp
        whenNotPaused
        returns (uint256)
    {
        return insurances[flightKey].depositsOf(addr);
    }

    function requestPending(bytes32 requestKey)
        public
        view
        onlyApp
        whenNotPaused
        returns (bool)
    {
        return requests[requestKey].pending;
    }

    function getFlightStatus(bytes32 flightKey)
        public
        view
        onlyApp
        whenNotPaused
        returns (uint8)
    {
        return flights[flightKey].statusCode;
    }

    function getFlightDetails(bytes32 flightKey)
        public
        view
        onlyApp
        whenNotPaused
        returns (
            string memory,
            uint8,
            uint256,
            address
        )
    {
        return (
            flights[flightKey].flight,
            flights[flightKey].statusCode,
            flights[flightKey].updatedTimestamp,
            flights[flightKey].airlineAddress
        );
    }

    function matchingIndex(uint8 index, address addr)
        private
        view
        returns (bool)
    {
        uint8[3] memory indexes = getOracleIndexes(addr);
        return
            (indexes[0] == index) ||
            (indexes[1] == index) ||
            (indexes[2] == index);
    }

    //endregion

    //region Utils
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getRoleAdmin(bytes32 role)
        public
        view
        override(AccessControl, IAccessControl)
        onlyApp
        whenNotPaused
        returns (bytes32)
    {
        return super.getRoleAdmin(role);
    }

    function grantRole(bytes32 role, address account)
        public
        override(AccessControl, IAccessControl)
        onlyApp
        whenNotPaused
    {
        super.grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account)
        public
        override(AccessControl, IAccessControl)
        onlyApp
        whenNotPaused
    {
        super.revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address account)
        public
        override(AccessControl, IAccessControl)
        onlyApp
        whenNotPaused
    {
        super.renounceRole(role, account);
    }

    function hasRole(bytes32 role, address account)
        public
        view
        override(AccessControl, IAccessControl)
        whenNotPaused
        returns (bool)
    {
        return super.hasRole(role, account);
    }

    function getRoleMember(bytes32 role, uint256 index)
        public
        view
        override
        onlyApp
        whenNotPaused
        returns (address)
    {
        return super.getRoleMember(role, index);
    }

    function getRoleMemberCount(bytes32 role)
        public
        view
        override
        onlyApp
        whenNotPaused
        returns (uint256)
    {
        return super.getRoleMemberCount(role);
    }

    //endregion

    //region Business logic
    function getAirlineFee()
        external
        view
        onlyApp
        whenNotPaused
        returns (uint256)
    {
        return AIRLINE_FEE;
    }

    function setAirlineFee(uint256 fee) external onlyApp whenNotPaused {
        AIRLINE_FEE = fee;
    }

    function registerFlight(
        bytes32 flightKey,
        string calldata flight,
        address addr,
        uint8 statusCode,
        uint256 timestamp
    ) external onlyApp whenNotPaused {
        flights[flightKey] = Flight(flight, true, statusCode, timestamp, addr);
    }

    function registerRequest(
        bytes32 requestKey,
        bytes32 flightKey,
        uint8 index
    ) external onlyApp whenNotPaused {
        requests[requestKey].pending = true;
        requests[requestKey].flightKey = flightKey;
        requests[requestKey].index = index;
    }

    function updateFlightStatus(bytes32 requestKey, uint8 statusCode)
        external
        onlyApp
        whenNotPaused
    {
        bytes32 flightKey = requests[requestKey].flightKey;
        requests[requestKey].pending = false;
        flights[flightKey].statusCode = statusCode;
        flights[flightKey].updatedTimestamp = block.timestamp;
    }

    //endregion

    //region Oracles

    function registerOracle(address addr, uint8[3] calldata indexes)
        external
        onlyApp
        whenNotPaused
    {
        _grantRole(ORACLE, addr);
        oracles[addr] = indexes;
    }

    function getOracleIndexes(address addr)
        public
        view
        whenNotPaused
        returns (uint8[3] memory)
    {
        return oracles[addr];
    }

    function submitOracleResponse(
        address addr,
        bytes32 requestKey,
        uint8 statusCode
    ) external onlyApp whenNotPaused returns (uint8) {
        uint8 index = requests[requestKey].index;
        require(requestPending(requestKey), "Request already fulfilled");
        require(
            matchingIndex(index, addr),
            "Request index not assigned to oracle"
        );
        require(
            !requests[requestKey].participants[addr],
            "Oracle already submitted response to request"
        );

        requests[requestKey].participants[addr] = true;
        requests[requestKey].responses[statusCode].push(addr);

        return uint8(requests[requestKey].responses[statusCode].length);
    }

    //endregion

    //region Payments

    function passengerDeposit(bytes32 flightKey, address addr)
        external
        payable
        onlyApp
        whenNotPaused
    {
        if (!insuranceRegistration[flightKey]) {
            insuranceRegistration[flightKey] = true;
            insurances[flightKey] = new Escrow();
        }
        insurances[flightKey].deposit{value: msg.value}(addr);
    }

    function passengerWithdraw(bytes32 flightKey, address addr)
        external
        onlyApp
        whenNotPaused
    {
        insurances[flightKey].withdraw(payable(addr));
    }

    function passengerPayBonus(bytes32 flightKey, address addr)
        external
        onlyApp
        whenNotPaused
    {
        uint256 bonus = insurances[flightKey].depositsOf(addr) / 2;
        insurances[flightKey].deposit{value: bonus}(addr);
    }

    function airlineDeposit(address addr)
        external
        payable
        onlyApp
        whenNotPaused
    {}

    function oracleDeposit(address addr)
        external
        payable
        onlyApp
        whenNotPaused
    {
        oracleEscrow.deposit(addr);
    }

    //endregion
}
