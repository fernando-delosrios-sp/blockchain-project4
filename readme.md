# Flight surety

This repository contains an Ethereum DApp that allows airline passengers to check the status of their flights and to purchase insurance for them in the event they're late for some reason. Passengers are entitled to an insurance should their insured flight is late for some reason. In the event the airline is responsible for the flight delay, the passenger gets 1.5 times their original insurance _for the flight_.

The flight checks are performed by delivering oracle requests on the blockchain in the shape of events. Those events are responded by registered oracles. Oracles are assigned indexes that must match the random index all requests include, so all of them have a chance to respond.

Passengers have the full list of current flights at their disposal. Flights are collected at runtime based on previous and future flight registration events. Passengers can click the desired flight and operate using the buttons and the insurance fee slider. They can change flights just by finding a new one in the list and clicking it. Events can be checked using the "Show events" button.

### Personal decisions

I've decided to use vetted OpenZeppelin contracts as much as possible. I found particularly helpful AccessControlEnumerable. Access control roles have a great fit into this project and are not only helpful for security but also to keep track of registered airlines, oracles and even airline voting system. It's simple, battle-tested code up for grabs that fits this project and many others. I implemented the operational switch with the Pausable contract too since it was a perfect fit for the requirement. Additionally, I thought Escrow was a great way to separate funds within the contract. In this case I decided to bound insurance deposits to flights instead of airlines. It made more sense to me and the code is very similar.

Once again I used Next.js and the usual suspects (listed below) as they're useful tools to me. I had to remove ConnectKit button at the last moment due to some errors but wagmi works the same with an injected wallet.

The basic set of data consists of two airlines with one flight for each available status, in the form of A1010 for airline 1 and flight code 10. Oracle responses for these flights will always be the assigned code. There's also flights like AXRND which will receive random responses from oracles. I believe this makes testing easier.

### Technologies used

- _Typescript_: although more complicated than vanilla JS, I think investing in learning Typescript pays off since most serious projects favour Typescript over Javascript, plus with IDE aids it makes for a nice developer experience and safer code.

- _Next.js_: I decided to try Next.js since it was the perfect time to try this framework for the first time. I took React Developer Udacity nanodegree before this and I wanted this project to be a refresher plus something new. I liked the experience and it will be my starting point for every React app from now on.

- _Chakra UI_: it's a rich, easy-to-use React UI component library I use for the second time. It is perhaps easier and leaner than MUI but a bit more limited from what I see. More than enough for the needs of this project and very popular among Web3 developers from what I see from examples in the Internet.

- _Wagmi_: it's a React hooks library for Web3. Useful and powerful for React with Typescript development but I'd say not the most popular around for the lack of examples or discussions.

### Instructions

- Run `npm install` to install dependencies
- Run `npm run ganache` and let it run for a local blockchain instance
- Run `npm run migrate` to deploy contracts on the blockchain
- Run `npm run server` to register airlines, oracles and flights and let it run
- Run `npm run dapp` to run the dapp. It will pick up the contract address from the current server run

### Authors

- Fernando de los Ríos Sánchez

### Acknowledgments

- Solidity
- Ganache-cli
- Truffle
- Next.js
- Chakra UI
- Wagmi
