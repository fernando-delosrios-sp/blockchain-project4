export const abi = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "airline",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "status",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "bytes32",
				name: "flightKey",
				type: "bytes32",
			},
		],
		name: "FlightStatusInfo",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "airline",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "status",
				type: "uint8",
			},
		],
		name: "OracleReport",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint8",
				name: "index",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "address",
				name: "airline",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "OracleRequest",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "Paused",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "Unpaused",
		type: "event",
	},
	{
		inputs: [],
		name: "AIRLINE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "CANDIDATE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "FUNDED",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "ORACLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "REGISTRATION_FEE",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "dataAddress",
				type: "address",
			},
		],
		name: "registerDataContract",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "candidateAddress",
				type: "address",
			},
			{
				internalType: "address",
				name: "supporterAddress",
				type: "address",
			},
		],
		name: "supporter",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "airlineAddress",
				type: "address",
			},
		],
		name: "candidate",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "airlineAddress",
				type: "address",
			},
		],
		name: "airline",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "airlineAddress",
				type: "address",
			},
		],
		name: "funded",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "oracleAddress",
				type: "address",
			},
		],
		name: "oracle",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
		],
		name: "oracleFees",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "flightKey",
				type: "bytes32",
			},
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
		],
		name: "passengerFees",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "pause",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "unpause",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getAirlineCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "getDataAddress",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "getMyIndexes",
		outputs: [
			{
				internalType: "uint8[3]",
				name: "",
				type: "uint8[3]",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "getOracleFee",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "pure",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "getPassengerFee",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "pure",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
			{
				internalType: "string",
				name: "flight",
				type: "string",
			},
		],
		name: "getFlightKey",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "pure",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
			{
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "getRequestKey",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "pure",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "key",
				type: "bytes32",
			},
		],
		name: "getFlightStatus",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "uint8",
				name: "status",
				type: "uint8",
			},
		],
		name: "lateFlight",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "pure",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "key",
				type: "bytes32",
			},
		],
		name: "getFlightDetails",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "key",
				type: "bytes32",
			},
		],
		name: "requestPending",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [],
		name: "getAirlineFee",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
		constant: true,
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256",
			},
		],
		name: "setAirlineFee",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
		],
		name: "registerAirline",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "registerFlight",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address",
			},
			{
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "fetchFlightStatus",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "registerOracle",
		outputs: [],
		stateMutability: "payable",
		type: "function",
		payable: true,
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "airlineAddress",
				type: "address",
			},
			{
				internalType: "string",
				name: "flight",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "requestTimestamp",
				type: "uint256",
			},
			{
				internalType: "uint8",
				name: "statusCode",
				type: "uint8",
			},
		],
		name: "submitOracleResponse",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "flightKey",
				type: "bytes32",
			},
		],
		name: "passengerDeposit",
		outputs: [],
		stateMutability: "payable",
		type: "function",
		payable: true,
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "flightKey",
				type: "bytes32",
			},
		],
		name: "passengerWithdraw",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "airlineDeposit",
		outputs: [],
		stateMutability: "payable",
		type: "function",
		payable: true,
	},
] as const;
