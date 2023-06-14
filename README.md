# Relay Unit Test Examples

This project demonstrates unit testing with Relay.  
It comes with sample counter contracts and unit tests for each.  
Fee payment in ETH (native), as well as ERC20 tokens is demonstrated where applicable.

Up until now a challenge with Relay aware smart contract development has been testing locally.  
For example, to call a `onlyGelatoRelay` function, the sender has to be the appropriate trusted forwarder and context has to be encoded in calldata.  
This makes writing unit tests tedious as relay backend behaviour has to be manually reimplemented locally.

This project aims to solve that problem by providing local variants of relay functions whilst supporting the same interface.

### Testing

Calling the function locally is as easy as swapping `callWithSyncFee` with `callWithSyncFeeLocal`.

### Debugging

All gelato contract logic is emulated locally so hardhat can run in its own instance (no gelato contacts present) as well as forked.

This project is in very early stages so feedback is much appreciated!

# Contracts and tests

- Counter (sponsored call)
- CounterERC2771 (sponsored call from trusted forwarder with sender)
- CounterContext (sync fee with fee collector, fee token, fee)
- CounterContextERC2771 (sync fee with fee collector, fee token, fee, sender)
- CounterFeeCollector (sync fee with fee collector)
- CounterFeeCollectorERC2771 (sync fee with fee collector, sender)

# Quick Start

1. Install project dependencies

```
npm install
```

2. Compile the contracts

```
npx hardhat compile
```

3. Run the unit tests

```
npx hardhat test
```
