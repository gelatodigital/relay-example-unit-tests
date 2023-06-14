# Relay Unit Test Examples

This project demonstrates unit testing with Relay.  
It comes with sample counter contracts and unit tests for each.  
Fee payment in ETH (native), as well as ERC20 tokens, is demonstrated where applicable.

Until now, a challenge with Relay aware smart contract development has been testing locally.
For example, to call a `onlyGelatoRelay` function, the sender must be a trusted forwarder and context must be encoded in calldata.
This makes writing unit tests tedious as relay backend behaviour has to be manually reimplemented locally.

This project aims to solve that problem by providing local variants of relay functions whilst supporting the same interface.
All gelato contract logic is emulated locally so hardhat can run in its own instance (no gelato contracts present) as well as forked.

### Testing

Calling the function locally is as easy as swapping `callWithSyncFee` with `callWithSyncFeeLocal`.  
This encodes context in calldata and impersonates the appropriate trusted forwarder making it ideal for unit tests.

```ts
const tx = await callWithSyncFeeLocal(request);
```

### Debugging (e.g., Tenderly)

Generating calldata is as easy as swapping `callWithSyncFee` with `encodeWithSyncFee`.  
Rather than executing the transaction, encoded calldata is returned which can be used for debugging in Tenderly.

```ts
const { to, from, data } = encodeWithSyncFee(request);
```

---

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
