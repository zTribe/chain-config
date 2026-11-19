import test from "node:test";
import assert from "node:assert/strict";
import { getChainConfig, requireChainConfig, getTokenByKey, getTokenByAddress, getWrappedNative,
  getOracle, getPaymentPolicy, isDirectPaymentAsset, isReserveDisplayAsset, validateChainConfig } from "../index.mjs";

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
  const testnet=structuredClone(getChainConfig(97));testnet.valuation.stablecoinCandidates.push("USDT");
  assert.throws(()=>validateChainConfig(testnet),/testnet assets/);
});
