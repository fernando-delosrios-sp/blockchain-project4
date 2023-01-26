import { ChakraProvider, extendTheme } from "@chakra-ui/react";
// import { ConnectKitProvider } from "connectkit";
import type { AppProps } from "next/app";
import FlightSuretyProvider from "../components/flightSurety";
import { client, WagmiConfig } from "../components/wagmi";

import "../styles/globals.css";

const theme = extendTheme({
	styles: {
		global: {
			body: {
				bg: "transparent",
			},
		},
	},
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<WagmiConfig client={client}>
				{/* <ConnectKitProvider> */}
				<FlightSuretyProvider>
					<Component {...pageProps} />
				</FlightSuretyProvider>
				{/* </ConnectKitProvider> */}
			</WagmiConfig>
		</ChakraProvider>
	);
}
