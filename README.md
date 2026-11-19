# zTribe Chain Config

Public, versioned EVM chain registry for zTribe Chat/Web and Indexer.

- One JSON file per chain (explicit mainnet/testnet environment), all validated with one schema/contract.
- Addresses, oracle feeds and token icon IDs are registered once per chain.
- `tokens` only identifies assets; registration or an icon does **not** grant payment, Reserve display or USD valuation rights.
- `payments.directAssets`, `reserve.displayAssets` and `valuation` are separate, explicit policies.
- Native currency is not an ERC-20. Current Tribe Token and Quote Token are dynamic and must be validated against trusted protocol data by each consumer.
- Newly configured chains must explicitly enable capabilities; unknown/disabled chains and assets fail closed for payment. Testnet symbols are not proof of real USD value.
- Do not store RPC keys, database secrets, environment-specific deployments, or private configuration here.
- Consumers must pin a commit/tag version; never fetch GitHub main at runtime.

## Quick start

```sh
npm test
```

Usage:

```js
import { getChainConfig, listChainConfigs, getTokenByAddress, isDirectPaymentAsset } from "@ztribe/chain-config";
const chain = getChainConfig(56);
const asset = getTokenByAddress(56, "0x55d398326f99059ff775485246999027b3197955");
const allowed = isDirectPaymentAsset(56, asset?.address);
```

For a new EVM chain, default all capabilities to false until protocol and indexer verification. Add one `chains/<network>.json`, run `npm run generate` to rebuild the import-free registry, and run validation/tests. The generated registry is checked in CI. Chain deployment, wallet support and Indexer adapters must be verified separately before any product capability is enabled.

## Quote Token → USD policy

The `valuation.quotePricing` mapping uses **registered token keys**, never display symbols. A quote may be `{type:"oracle",feed:"BNB_USD"}`, `{type:"fixed",usd:"1"}` (mainnet approximation) or `{type:"simulated",usd:"600"}` (testnet-only). `getQuoteUsdPolicy(chainId, trustedQuoteTokenAddress)` resolves that policy by chain and exact address and returns `null` for an unknown or unconfigured quote. Callers must use the trusted token's actual Quote Token and separately read/cache the oracle where needed. No ETH/BTC quote feeds are activated until their actual on-chain feeds are verified. A registered icon or payment permission never implies a quote pricing source.

The testnet WBNB simulated value defaults to 600 USD here; this is **not real market value**. For future production chains, configure verified feed addresses and use freshness/positive-answer safeguards in the Indexer. Runtime secrets and RPC credentials must not be committed here.

Testnet price feeds now use Binance Oracle BNB/USD, ETH/USD, BTC/USD, USDT/USD, USDC/USD, BUSD/USD and DAI/USD adapters, verified against https://oracle.binance.com/docs/price-feeds/contract-addresses/bnb-testnet/ . Testnet values remain test-only representations, not a statement of real asset value. Individual feeds carry maxAgeSeconds (129600 on testnet, accommodating the documented daily update cadence). Unknown or unavailable feeds must fail closed, without simulated-price fallback.
