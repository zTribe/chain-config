import mainnet from "./chains/bsc-mainnet.json" with { type: "json" };
import testnet from "./chains/bsc-testnet.json" with { type: "json" };
import { validateChainConfig } from "./validate.mjs";

const configurations = new Map();
for (const chain of [mainnet, testnet]) {
  validateChainConfig(chain);
  if (configurations.has(chain.chainId)) throw new Error("Duplicate Chain ID: " + chain.chainId);
  configurations.set(chain.chainId, chain);
}

const validAddress = value => typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);

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
  const token = getChainConfig(chainId)?.tokens?.[key];
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
  return Boolean(token && getChainConfig(chainId).payments.directAssets.includes(token.key));
}
export function isReserveDisplayAsset(chainId, address) {
  const token = getTokenByAddress(chainId, address);
  return Boolean(token && getChainConfig(chainId).reserve.displayAssets.includes(token.key));
}
export function getPaymentPolicy(chainId) {
  return getChainConfig(chainId)?.payments ?? null;
}
export function getReservePolicy(chainId) {
  return getChainConfig(chainId)?.reserve ?? null;
}
export function getOracle(chainId, key) {
  return getChainConfig(chainId)?.oracles?.[key] ?? null;
}
export function getWrappedNative(chainId) {
  const chain = getChainConfig(chainId);
  return chain ? getTokenByKey(chainId, chain.contracts.wrappedNative) : null;
}
export { validateChainConfig } from "./validate.mjs";
