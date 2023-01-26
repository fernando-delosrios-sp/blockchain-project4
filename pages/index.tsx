import {
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Heading,
	HStack,
	ListItem,
	Spacer,
	Text,
	UnorderedList,
	useDisclosure,
} from "@chakra-ui/react";
// import { ConnectKitButton } from "connectkit";
import { useContext } from "react";
import FlightCard from "../components/flightCard";
import { FlightSuretyContext } from "../components/flightSurety";

export default function Home() {
	const { flights, events, maxFee } = useContext(FlightSuretyContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	console.log(events);
	let eventId = 1;
	return (
		<>
			<HStack>
				<Button onClick={onOpen}>Show events</Button>
				<Spacer></Spacer>
				{/* <ConnectKitButton></ConnectKitButton> */}
			</HStack>
			<Box marginX="30%" marginTop="150px">
				<Card>
					<CardHeader>
						<Heading size="xl">Flight surety</Heading>
					</CardHeader>

					<CardBody maxHeight="400px" overflow="scroll">
						{flights.map((flight) => (
							<FlightCard key={flight.name} {...flight} />
						))}
					</CardBody>
				</Card>
			</Box>
			<Drawer isOpen={isOpen} placement="left" onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>Emitted events</DrawerHeader>

					<DrawerBody>
						<UnorderedList>
							{events.map((event) => (
								<ListItem key={eventId++}>
									<Text>{event.type}</Text>
									<Text fontSize="small">
										{JSON.stringify(event.attributes)}
									</Text>
								</ListItem>
							))}
						</UnorderedList>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
}
