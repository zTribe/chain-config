import test from "node:test";
import assert from "node:assert/strict";
import { getChainConfig, requireChainConfig, getTokenByKey, getTokenByAddress, getWrappedNative,
  getOracle, getPaymentPolicy, listChainConfigs, isDirectPaymentAsset, isReserveDisplayAsset, getQuoteUsdPolicy, validateChainConfig } from "../index.mjs";

const USDT56 = "0x55d398326f99059ff775485246999027b3197955";
const USDT97 = "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd";
test("BSC mainnet and testnet independently resolve assets", () => {
  assert.equal(getChainConfig(56).slug, "bsc-mainnet");
  assert.equal(getChainConfig(97).slug, "bsc-testnet");
  assert.equal(getChainConfig(8453), null);
  assert.throws(()=>requireChainConfig(8453), /Unsupported chain/);
  assert.equal(getTokenByAddress(56,USDT56)?.key,"USDT");
  assert.equal(getTokenByAddress(97,USDT56), null);
  assert.equal(getTokenByAddress(97,USDT97)?.key,"USDT");
  assert.equal(getWrappedNative(97).address.toLowerCase(),"0xae13d989dac2f0debff460ac112a837c89baa7cd");
  assert.equal(getOracle(56,"BNB_USD").adapter,"chainlink-aggregator-v3");
});
test("icons do not imply direct payment or Reserve display permission", () => {
  const btc = getTokenByKey(56,"BTCB");
  assert.equal(btc.icon,"btc");
  assert.equal(isDirectPaymentAsset(56,btc.address),false);
  assert.equal(isReserveDisplayAsset(56,btc.address),false);
  assert.equal(isDirectPaymentAsset(56,USDT56),true);
  assert.equal(isReserveDisplayAsset(56,USDT56),true);
  assert.equal(isDirectPaymentAsset(56,"0x0000000000000000000000000000000000000001"),false);
  assert.equal(isDirectPaymentAsset(97,USDT56),false);
  assert.equal(isDirectPaymentAsset(97,getTokenByKey(97,"USDT_FAUCET").address),false);
});
test("policy always swaps unrecognized fixed assets to chain wrapped native", () => {
  for(const chainId of [56,97]) {
    const policy=getPaymentPolicy(chainId);
    assert.equal(policy.fallbackSwapAsset,"WBNB");
    assert.ok(policy.directAssets.includes("WBNB"));
  }
});
test("reject unsafe or misconfigured policies and duplicate assets", () => {
  const clone=()=>structuredClone(getChainConfig(56));
  const duplicate=clone();duplicate.tokens.FAKE={...duplicate.tokens.USDT};
  assert.throws(()=>validateChainConfig(duplicate),/duplicate token address/);
  const unknown=clone();unknown.payments.directAssets.push("MISSING");
  assert.throws(()=>validateChainConfig(unknown),/unknown token key/);
  const fake=clone();fake.tokens.USDT.address="0x0000000000000000000000000000000000000000";
  assert.throws(()=>validateChainConfig(fake),/nonzero/);
  const testnet=structuredClone(getChainConfig(97));testnet.valuation.quotePricing.USDT={type:"fixed",usd:"1"};
  assert.throws(()=>validateChainConfig(testnet),/testnet fixed/);
});

test("configuration is immutable and reserved property names are not assets", () => {
  const original = getChainConfig(56).tokens.USDT.address;
  assert.equal(Object.isFrozen(getChainConfig(56).tokens.USDT), true);
  assert.throws(() => { getChainConfig(56).tokens.USDT.address = "0x0000000000000000000000000000000000000001"; }, TypeError);
  assert.equal(getChainConfig(56).tokens.USDT.address, original);
  assert.equal(getTokenByKey(56, "__proto__"), null);
  assert.equal(getTokenByKey(56, "constructor"), null);
});

test("features for newly configured networks are explicit and fail closed", () => {
  const disabled = structuredClone(getChainConfig(56));
  disabled.capabilities.payments = false;
  disabled.capabilities.reserve = false;
  validateChainConfig(disabled);
  assert.throws(() => validateChainConfig({...disabled,capabilities:{payments:"true",reserve:false,valuation:true}}), /capability flags/);
  assert.throws(() => validateChainConfig({...disabled,capabilities:{payments:false,reserve:false}}), /missing: valuation/);
});

test("all registered chains can be enumerated without mutable references", () => {
  assert.deepEqual(listChainConfigs().map(x => x.chainId).sort((a,b)=>a-b), [56,97]);
  assert.equal(Object.isFrozen(listChainConfigs()[0]), true);
});

test("environment is explicitly typed, independent from chain name", () => {
  assert.equal(getChainConfig(56).environment, "mainnet");
  assert.equal(getChainConfig(97).environment, "testnet");
  const copied = structuredClone(getChainConfig(97));
  copied.environment = "staging";
  assert.throws(() => validateChainConfig(copied), /network environment/);
});

test("quote USD policies use registered addresses, not display symbols", () => {
  assert.deepEqual(getQuoteUsdPolicy(56, USDT56), {kind:"fixed", usd:"1", simulated:false});
  assert.equal(getQuoteUsdPolicy(97, USDT97).kind,"oracle");
  assert.equal(getQuoteUsdPolicy(97, USDT97).oracle.adapter,"binance-oracle-aggregator-v3");
  assert.equal(getQuoteUsdPolicy(97, USDT56), null);
  assert.equal(getQuoteUsdPolicy(97, getTokenByKey(97,"USDT_FAUCET").address), null);
  assert.equal(getQuoteUsdPolicy(56, getTokenByKey(56,"BTCB").address), null);
  assert.deepEqual(getQuoteUsdPolicy(56,getTokenByKey(56,"BUSD").address),{kind:"fixed",usd:"1",simulated:false});
  assert.equal(getQuoteUsdPolicy(8453, USDT56), null);
  assert.equal(getQuoteUsdPolicy(56, "not-an-address"), null);
  assert.equal(getQuoteUsdPolicy(56, getWrappedNative(56).address).kind,"oracle");
  assert.equal(getQuoteUsdPolicy(97, getWrappedNative(97).address).kind,"oracle");
  assert.equal(getQuoteUsdPolicy(97, getWrappedNative(97).address).simulated,true);
  const invalid=structuredClone(getChainConfig(97)); invalid.valuation.quotePricing.BTCB={type:"oracle",feed:"MISSING"};
  assert.throws(()=>validateChainConfig(invalid),/unknown quote oracle/);
  invalid.valuation.quotePricing.BTCB={type:"simulated",usd:"0"};
  assert.throws(()=>validateChainConfig(invalid),/invalid quote USD/);
  const extra=structuredClone(getChainConfig(56)); extra.valuation.quotePricing.ETH={type:"oracle",feed:"ETH_USD"};
  assert.throws(()=>validateChainConfig(extra),/unknown quote oracle/);
  assert.equal(getQuoteUsdPolicy(97, getWrappedNative(97).address).oracle.maxAgeSeconds,129600);
});

test("decimal USD quotes and price source validation are consistent", () => {
  const good=structuredClone(getChainConfig(56));
  good.valuation.quotePricing.USDT={type:"fixed",usd:"1.25"};
  assert.doesNotThrow(()=>validateChainConfig(good));
  const tiny=structuredClone(getChainConfig(97));
  tiny.valuation.quotePricing.USDC={type:"simulated",usd:"0.000001"};
  assert.doesNotThrow(()=>validateChainConfig(tiny));
  for (const invalidUsd of ["0","0.0","1\\x25","-1","1e8","Infinity","NaN","1."]) {
    good.valuation.quotePricing.USDT={type:"fixed",usd:invalidUsd};
    assert.throws(()=>validateChainConfig(good),/invalid quote USD/,invalidUsd);
  }
});

test("testnet quote feeds have official dedicated adapters and bounded age", () => {
  const configured=getChainConfig(97);
  for(const key of ["WBNB","ETH","BTCB","USDT","USDC","BUSD","DAI"]) {
    const result=getQuoteUsdPolicy(97,configured.tokens[key].address);
    assert.equal(result.kind,"oracle",key);
    assert.equal(result.oracle.adapter,"binance-oracle-aggregator-v3",key);
    assert.equal(result.oracle.maxAgeSeconds,129600,key);
  }
  const bad=structuredClone(configured);
  bad.oracles.BNB_USD.maxAgeSeconds=-1;
  assert.throws(()=>validateChainConfig(bad),/maxAgeSeconds/);
  bad.oracles.BNB_USD.maxAgeSeconds=129600;
  assert.doesNotThrow(()=>validateChainConfig(bad));
});
