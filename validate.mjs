const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const KEY = /^[A-Z][A-Z0-9_]*$/;
const ICON = /^[a-z0-9-]+$/;
function fail(message) { throw new Error("Invalid chain config: " + message); }
function isRecord(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function keysOnly(obj, keys, label) {
  for (const key of Object.keys(obj)) if (!keys.includes(key)) fail(label + " unexpected field: " + key);
  for (const key of keys) if (!(key in obj)) fail(label + " missing: " + key);
}
function verifyAddress(s, label) { if (typeof s !== "string" || !ADDRESS.test(s) || /^0x0{40}$/i.test(s)) fail(label + " must be nonzero EVM address"); }
function uniqueList(keys, tokens, label) {
  if (!Array.isArray(keys) || keys.some(k => typeof k !== "string" || !Object.hasOwn(tokens,k)) || new Set(keys).size !== keys.length) fail(label + " has duplicate or unknown token key");
}
export function validateChainConfig(c) {
  if (!isRecord(c)) fail("root is not an object");
  keysOnly(c, ["schemaVersion","chainId","slug","name","environment","nativeCurrency","tokens","contracts","oracles","payments","reserve","valuation","capabilities"], "root");
  if (c.schemaVersion !== 2 || !Number.isSafeInteger(c.chainId) || c.chainId < 1) fail("schemaVersion/chainId");
  if (typeof c.slug !== "string" || !/^[a-z0-9-]+$/.test(c.slug) || typeof c.name !== "string" || !c.name) fail("slug/name");
  if (!["mainnet","testnet"].includes(c.environment)) fail("network environment");
  if (!isRecord(c.nativeCurrency)) fail("nativeCurrency");
  keysOnly(c.nativeCurrency,["symbol","decimals","icon"],"nativeCurrency");
  if (!c.nativeCurrency.symbol || !Number.isInteger(c.nativeCurrency.decimals) || c.nativeCurrency.decimals < 0 || c.nativeCurrency.decimals > 36 || !ICON.test(c.nativeCurrency.icon)) fail("native currency details");
  if (!isRecord(c.tokens) || !Object.keys(c.tokens).length) fail("tokens");
  const addresses = new Set();
  for (const [key,t] of Object.entries(c.tokens)) {
    if (!KEY.test(key) || !isRecord(t)) fail("token key/shape " + key);
    const allowed = ["address","symbol","decimals","icon"];
    for (const k of Object.keys(t)) if (!allowed.includes(k)) fail("token unexpected field " + key + ":" + k);
    for (const k of ["address","symbol","icon"]) if (!(k in t)) fail("token missing " + key + ":" + k);
    verifyAddress(t.address, "tokens." + key);
    if (addresses.has(t.address.toLowerCase())) fail("duplicate token address " + key);
    addresses.add(t.address.toLowerCase());
    if (typeof t.symbol !== "string" || !t.symbol || typeof t.icon !== "string" || !ICON.test(t.icon)) fail("token symbol/icon " + key);
    if ("decimals" in t && (!Number.isInteger(t.decimals) || t.decimals < 0 || t.decimals > 36)) fail("token decimals " + key);
  }
  if (!isRecord(c.contracts)) fail("contracts");
  keysOnly(c.contracts,["wrappedNative"],"contracts");
  if (!Object.hasOwn(c.tokens,c.contracts.wrappedNative)) fail("wrappedNative must reference token");
  if (c.tokens[c.contracts.wrappedNative].decimals !== c.nativeCurrency.decimals) fail("wrappedNative precision mismatch");
  if (!isRecord(c.oracles)) fail("oracles");
  for (const [key, oracle] of Object.entries(c.oracles)) {
    if (!KEY.test(key) || !isRecord(oracle)) fail("oracle " + key);
    keysOnly(oracle,["address","adapter"],"oracles." + key);
    verifyAddress(oracle.address,"oracles." + key);
    if (!["chainlink-aggregator-v3","binance-oracle-aggregator-v3"].includes(oracle.adapter)) fail("unknown oracle adapter");
  }
  if (!isRecord(c.payments) || !isRecord(c.reserve) || !isRecord(c.valuation) || !isRecord(c.capabilities)) fail("policies/capabilities");
  keysOnly(c.capabilities,["payments","reserve","valuation"],"capabilities");
  if (Object.values(c.capabilities).some(value => typeof value !== "boolean")) fail("capability flags must be boolean");
  keysOnly(c.payments,["directAssets","dynamicTribeToken","dynamicQuoteToken","fallbackSwapAsset"],"payments");
  keysOnly(c.reserve,["displayAssets","dynamicTribeToken","dynamicQuoteToken"],"reserve");
  uniqueList(c.payments.directAssets,c.tokens,"payments.directAssets");
  uniqueList(c.reserve.displayAssets,c.tokens,"reserve.displayAssets");
  keysOnly(c.valuation,["quotePricing"],"valuation");
  if (!isRecord(c.valuation.quotePricing)) fail("valuation.quotePricing");
  for (const [key,source] of Object.entries(c.valuation.quotePricing)) {
    if (!KEY.test(key) || !Object.hasOwn(c.tokens,key) || !isRecord(source)) fail("unknown quote token key: " + key);
    if (source.type === "oracle") {
      keysOnly(source,["type","feed"],"quotePricing." + key);
      if (typeof source.feed !== "string" || !Object.hasOwn(c.oracles,source.feed)) fail("unknown quote oracle: " + key);
    } else if (source.type === "fixed" || source.type === "simulated") {
      keysOnly(source,["type","usd"],"quotePricing." + key);
      if (typeof source.usd !== "string" || !/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(source.usd) || !/[1-9]/.test(source.usd)) fail("invalid quote USD: " + key);
      if (source.type === "simulated" && c.environment !== "testnet") fail("simulated quote price requires testnet");
      if (source.type === "fixed" && c.environment === "testnet") fail("testnet fixed quote USD is not real USD");
    } else fail("unknown quote price source: " + key);
  }
  for (const p of [c.payments,c.reserve]) if (typeof p.dynamicTribeToken !== "boolean" || typeof p.dynamicQuoteToken !== "boolean") fail("dynamic token flags");
  if (!c.payments.directAssets.includes(c.payments.fallbackSwapAsset) || c.payments.fallbackSwapAsset !== c.contracts.wrappedNative) fail("fallback swap token must be direct-payment wrapped native");
  return c;
}
