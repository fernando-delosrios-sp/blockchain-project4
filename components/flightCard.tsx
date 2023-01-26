import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	HStack,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Spacer,
	Text,
	VStack,
} from "@chakra-ui/react";
// import { ConnectKitButton } from "connectkit";
import { ethers } from "ethers";
import { useContext, useState } from "react";
import {
	useAccount,
	useConnect,
	useContractWrite,
	usePrepareContractWrite,
} from "wagmi";
import { abi } from "../components/contract";
import {
	Flight,
	FlightSuretyContext,
	Status,
} from "../components/flightSurety";

const statusColour = (status: number): string => {
	let colour: string = "red";
	switch (status) {
		case 0:
			colour = "gray";
			break;
		case 10:
			colour = "green";
			break;
		default:
			break;
	}
	return colour;
};

export default function FlightCard(params: Flight) {
	const { maxFee, address } = useContext(FlightSuretyContext);
	const passengerMaxFee = parseInt(ethers.utils.formatEther(maxFee || 0));
	const sliderStep = passengerMaxFee / 20;
	const [fee, setFee] = useState(passengerMaxFee);
	const [deposited, setDeposited] = useState(false);
	const [isHovering, setHovering] = useState(false);
	const [isActive, setActive] = useState(false);
	const { isDisconnected } = useAccount();
	const { connect, connectors } = useConnect();
	function isDelayed() {
		return params.status > 10;
	}

	const { config: fetchFlightStatusConfig } = usePrepareContractWrite({
		address,
		abi,
		functionName: "fetchFlightStatus",
		args: [
			params.airline_address as `0x${string}`,
			params.name,
			params.timestamp,
		],
		enabled: isActive,
	});
	const fetchFlightStatus = useContractWrite(fetchFlightStatusConfig);

	const { config: passengerDepositConfig } = usePrepareContractWrite({
		address,
		abi,
		functionName: "passengerDeposit",
		args: [params.flightKey as `0x${string}`],
		overrides: {
			value: ethers.utils.parseEther(fee.toString()),
		},
		enabled: isActive && !deposited,
	});
	const passengerDeposit = useContractWrite(passengerDepositConfig);

	const { config: passengerWithdrawConfig } = usePrepareContractWrite({
		address,
		abi,
		functionName: "passengerWithdraw",
		args: [params.flightKey as `0x${string}`],
		enabled: isActive && deposited,
	});
	const passengerWithdraw = useContractWrite(passengerWithdrawConfig);

	function handleMouseEnter() {
		setHovering(true);
	}
	function handleMouseLeave() {
		setHovering(false);
		setActive(false);
	}

	function handleClick() {
		setActive(true);
	}

	function handleRefresh() {
		fetchFlightStatus.reset();
		isDisconnected && connect({ connector: connectors[0] });
		fetchFlightStatus.write?.();
	}

	function handleDeposit() {
		passengerDeposit.reset();
		isDisconnected && connect({ connector: connectors[0] });
		passengerDeposit.writeAsync?.().then(() => setDeposited(true));
	}

	function handleWithdraw() {
		passengerWithdraw.reset();
		isDisconnected && connect({ connector: connectors[0] });
		passengerWithdraw.writeAsync?.().then(() => setDeposited(false));
	}

	return (
		<Card
			margin="10px"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
			style={{
				position: "relative",
				top: isHovering ? "-2px" : "0px",
				backgroundColor: isHovering ? "GhostWhite" : "white",
				transition: "top ease 0.5s, background-color ease 0.5s",
			}}
		>
			<CardBody padding="15px">
				<VStack>
					<HStack height="70px" width="100%">
						<Box display="flex" alignItems="center" gap="5px" width="30%">
							<Text fontSize="xl" as="b">
								{params.name}
							</Text>
							<Text>by {params.airline_name}</Text>
						</Box>
						<Spacer />
						{isActive && (
							<Box paddingTop="25px">
								<Box display="flex" gap="5px">
									<Button size="sm" onClick={handleRefresh}>
										Refresh status
									</Button>
									{deposited || (
										<Button size="sm" onClick={handleDeposit}>
											Deposit insurance
										</Button>
									)}
									{deposited && (
										<Button size="sm" onClick={handleWithdraw}>
											Withdraw insurance
										</Button>
									)}
								</Box>
								<Box width="100%" display="flex">
									<Slider
										max={passengerMaxFee}
										step={sliderStep}
										value={fee}
										aria-label="slider-ex-1"
										defaultValue={passengerMaxFee}
										onChange={(e) => setFee(e)}
										display="inline"
									>
										<SliderTrack>
											<SliderFilledTrack />
										</SliderTrack>
										<SliderThumb />
									</Slider>
									<Text width="75px" textAlign="right" fontSize="small">
										{fee} ETH
									</Text>
								</Box>
							</Box>
						)}
					</HStack>
					<HStack width="100%" alignItems="center">
						<Box>
							<Text fontSize="small">
								Last update:{" "}
								{new Date(params.timestamp.toNumber() * 1000).toISOString()}
							</Text>
						</Box>
						<Spacer />
						<Box>
							<Badge colorScheme={statusColour(params.status)}>
								{Status[params.status]}
							</Badge>
						</Box>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
