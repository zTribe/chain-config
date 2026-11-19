import chainData from "./registry.generated.mjs";
import { validateChainConfig } from "./validate.mjs";

const configurations = new Map();
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
for (const chain of chainData) {
  validateChainConfig(chain);
  if (configurations.has(chain.chainId)) throw new Error("Duplicate Chain ID: " + chain.chainId);
  configurations.set(chain.chainId, deepFreeze(chain));
}

const validAddress = value => typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);

/** Immutable snapshots of all registered networks; no network calls. */
export function listChainConfigs() { return [...configurations.values()]; }
export function getChainConfig(chainId) {
  if (!Number.isSafeInteger(Number(chainId))) return null;
  return configurations.get(Number(chainId)) ?? null;
}
export function requireChainConfig(chainId) {
  const chain = getChainConfig(chainId);
  if (!chain) throw new Error("Unsupported chain: " + chainId);
  return chain;
}
export function getTokenByKey(chainId, key) {
  const tokens = getChainConfig(chainId)?.tokens;
  const token = tokens && Object.hasOwn(tokens, key) ? tokens[key] : null;
  return token ? {key, ...token} : null;
}
export function getTokenByAddress(chainId, address) {
  if (!validAddress(address)) return null;
  const entries = Object.entries(getChainConfig(chainId)?.tokens ?? {});
  const hit = entries.find(([, token]) => token.address.toLowerCase() === address.toLowerCase());
  return hit ? {key: hit[0], ...hit[1]} : null;
}
/** Returns only configured fixed assets; dynamic Tribe/Quote assets require consumer-side trusted context. */
export function isDirectPaymentAsset(chainId, address) {
  const token = getTokenByAddress(chainId, address);
  return Boolean(token && getChainConfig(chainId).capabilities.payments && getChainConfig(chainId).payments.directAssets.includes(token.key));
}
export function isReserveDisplayAsset(chainId, address) {
  const token = getTokenByAddress(chainId, address);
  return Boolean(token && getChainConfig(chainId).capabilities.reserve && getChainConfig(chainId).reserve.displayAssets.includes(token.key));
}
export function getPaymentPolicy(chainId) {
  const chain = getChainConfig(chainId);
  return chain?.capabilities.payments ? chain.payments : null;
}
export function getReservePolicy(chainId) {
  const chain = getChainConfig(chainId);
  return chain?.capabilities.reserve ? chain.reserve : null;
}
export function getOracle(chainId, key) {
  return getChainConfig(chainId)?.oracles?.[key] ?? null;
}
export function getWrappedNative(chainId) {
  const chain = getChainConfig(chainId);
  return chain ? getTokenByKey(chainId, chain.contracts.wrappedNative) : null;
}
/** USD conversion policy for a trusted token quote address. Never uses symbol matching. */
export function getQuoteUsdPolicy(chainId, quoteAddress) {
  const chain = getChainConfig(chainId);
  if (!chain?.capabilities.valuation) return null;
  const token = getTokenByAddress(chainId, quoteAddress);
  if (!token) return null;
  if (token.key === chain.contracts.wrappedNative) {
    const oracleKey = chain.valuation.nativeOracle;
    if (!oracleKey) return null;
    return { kind: "native", oracle: chain.oracles[oracleKey], simulated: chain.environment === "testnet" };
  }
  if (chain.valuation.stablecoinCandidates.includes(token.key)) {
    return { kind: "fixed", usd: "1", simulated: false };
  }
  if (chain.valuation.simulatedQuoteAssets.includes(token.key)) {
    return { kind: "fixed", usd: "1", simulated: true };
  }
  return null;
}
export { validateChainConfig } from "./validate.mjs";
