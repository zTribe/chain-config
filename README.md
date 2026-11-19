# zTribe Chain Config

Public, versioned EVM chain registry for zTribe Chat/Web and Indexer.

- One JSON file per chain, all validated with one schema/contract.
- Addresses, oracle feeds and token icon IDs are registered once per chain.
- `tokens` only identifies assets; registration or an icon does **not** grant payment, Reserve display or USD valuation rights.
- `payments.directAssets`, `reserve.displayAssets` and `valuation` are separate, explicit policies.
- Native currency is not an ERC-20. Current Tribe Token and Quote Token are dynamic and must be validated against trusted protocol data by each consumer.
- Unknown chains/assets fail closed for payment. Testnet symbols are not proof of real USD value.
- Do not store RPC keys, database secrets, environment-specific deployments, or private configuration here.
- Consumers must pin a commit/tag version; never fetch GitHub main at runtime.

## Quick start

```sh
npm test
```

Usage:

```js
import { getChainConfig, getTokenByAddress, isDirectPaymentAsset } from "@ztribe/chain-config";
const chain = getChainConfig(56);
const asset = getTokenByAddress(56, "0x55d398326f99059ff775485246999027b3197955");
const allowed = isDirectPaymentAsset(56, asset?.address);
```

For a new EVM chain, add one `chains/<network>.json`, include its import in `index.mjs`, and run validation/tests. Chain deployment, wallet support and Indexer adapters must be verified separately before any product capability is enabled.
