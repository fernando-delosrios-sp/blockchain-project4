import { BigNumber } from "ethers";
import { Result } from "ethers/lib/utils.js";
import { createContext, ReactElement, useEffect, useReducer } from "react";
import {
	useContract,
	useContractEvent,
	useContractRead,
	useProvider,
} from "wagmi";
import config from "../config.json";
import { abi } from "./contract";

type Props = {
	children: ReactElement;
};

enum Status {
	"Unknown" = 0,
	"On time" = 10,
	"Late (reason: airline)" = 20,
	"Late (reason: weather)" = 30,
	"Late (reason: technical)" = 40,
	"Late (reason: other)" = 50,
}

type Flight = {
	name: string;
	flightKey: string;
	airline_address: string;
	airline_name: string;
	status: number;
	timestamp: BigNumber;
};

type dict = {
	[id: string]: string;
};

type Event = {
	type: string;
	attributes: dict;
};

type FlightSuretyProps = {
	events: Event[];
	flights: Flight[];
	maxFee: BigNumber | undefined;
	address: `0x${string}`;
};

const FlightSuretyContext = createContext<FlightSuretyProps>({
	events: [],
	flights: [],
	maxFee: undefined,
	address: "0x0",
});

const { airlines } = config;
const address = config.address as `0x${string}`;

const { Provider } = FlightSuretyContext;

export default function FlightSuretyProvider({ children }: Props) {
	const flightReducer = (prev: Flight[], next: Flight): Flight[] => {
		const index = prev.findIndex((x) => x.name === next.name);
		if (index > -1) {
			prev.splice(index, 1);
		}
		return [...prev, next].sort((a, b) => (a.name > b.name ? 1 : -1));
	};

	const eventReducer = (prev: Event[], next: Event): Event[] => {
		return [...prev, next];
	};

	const provider = useProvider();
	const [events, updateEvents] = useReducer(eventReducer, []);
	const [flights, updateFlights] = useReducer(flightReducer, []);

	const contract = useContract({
		address,
		abi,
		signerOrProvider: provider,
	});

	const processFlightStatusInfo = (
		airline: `0x${string}`,
		name: string,
		timestamp: BigNumber,
		status: number,
		flightKey: `0x${string}`
	): Flight => {
		const airline_address: string = airline.toLowerCase();
		const airline_name: string =
			airlines[airline_address as keyof typeof airlines].name;

		return {
			name,
			airline_address,
			airline_name,
			status,
			timestamp,
			flightKey,
		};
	};

	useEffect(() => {
		contract?.queryFilter("FlightStatusInfo", 0).then((events) => {
			for (let event of events) {
				const args = event.args as Result;
				const name = args["flight"];
				const airline = args["airline"];
				const timestamp = args["timestamp"];
				const status = args["status"];
				const flightKey = args["flightKey"];
				const flight: Flight = processFlightStatusInfo(
					airline,
					name,
					timestamp,
					status,
					flightKey
				);
				updateFlights(flight);
			}
		});
	}, [contract]);

	const { data: maxFee } = useContractRead({
		address,
		abi,
		functionName: "getPassengerFee",
	});

	useContractEvent({
		address,
		abi,
		eventName: "FlightStatusInfo",
		listener(
			airline: `0x${string}`,
			flight: string,
			timestamp: BigNumber,
			status: number,
			flightKey: `0x${string}`
		) {
			const f: Flight = processFlightStatusInfo(
				airline,
				flight,
				timestamp,
				status,
				flightKey
			);
			updateFlights(f);
			const attributes: dict = {};
			attributes["airline"] = airline;
			attributes["flight"] = flight;
			attributes["status"] = Status[status];
			attributes["timestamp"] = new Date(timestamp.toNumber()).toISOString();
			attributes["flightKey"] = flightKey;
			const evt: Event = {
				type: "FlightStatusInfo",
				attributes,
			};
			updateEvents(evt);
		},
	});

	useContractEvent({
		address,
		abi,
		eventName: "OracleReport",
		listener(address, flight, timestamp, status) {
			const attributes: dict = {};
			attributes["address"] = address;
			attributes["flight"] = flight;
			attributes["status"] = Status[status];
			attributes["timestamp"] = new Date(timestamp.toNumber()).toISOString();
			const evt: Event = {
				type: "OracleReport",
				attributes,
			};
			updateEvents(evt);
		},
	});

	useContractEvent({
		address,
		abi,
		eventName: "OracleRequest",
		listener(index, airline, flight, timestamp) {
			const attributes: dict = {};
			attributes["index"] = index.toString();
			attributes["flight"] = flight;
			attributes["airline"] = airline;
			attributes["timestamp"] = new Date(timestamp.toNumber()).toISOString();
			const evt: Event = {
				type: "OracleRequest",
				attributes,
			};
			updateEvents(evt);
		},
	});

	const props: FlightSuretyProps = {
		flights,
		events,
		maxFee,
		address,
	};

	return <Provider value={props}>{children}</Provider>;
}

export { FlightSuretyContext, type FlightSuretyProps, type Flight, Status };
