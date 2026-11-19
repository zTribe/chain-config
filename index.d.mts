export interface TokenConfig {
  address: string;
  symbol: string;
  icon: string;
  decimals?: number;
}
export interface OracleConfig {
  address: string;
  adapter: "chainlink-aggregator-v3" | "binance-oracle-aggregator-v3";
}
export interface PaymentPolicy {
  directAssets: readonly string[];
  dynamicTribeToken: boolean;
  dynamicQuoteToken: boolean;
  fallbackSwapAsset: string;
}
export interface ReservePolicy {
  displayAssets: readonly string[];
  dynamicTribeToken: boolean;
  dynamicQuoteToken: boolean;
}
export interface ChainConfig {
  schemaVersion: 1;
  chainId: number;
  slug: string;
  name: string;
  nativeCurrency: {symbol: string; decimals: number; icon: string};
  tokens: Readonly<Record<string, TokenConfig>>;
  contracts: {wrappedNative: string};
  oracles: Readonly<Record<string, OracleConfig>>;
  payments: PaymentPolicy;
  reserve: ReservePolicy;
  valuation: {nativeOracle: string | null; stablecoinCandidates: readonly string[]; assumeTestnetRealUsd: boolean};
}
export type TokenInfo = TokenConfig & { key: string };
export function getChainConfig(chainId: number | string): ChainConfig | null;
export function requireChainConfig(chainId: number | string): ChainConfig;
export function getTokenByKey(chainId: number | string, key: string): TokenInfo | null;
export function getTokenByAddress(chainId: number | string, address: string): TokenInfo | null;
export function isDirectPaymentAsset(chainId: number | string, address: string): boolean;
export function isReserveDisplayAsset(chainId: number | string, address: string): boolean;
export function getPaymentPolicy(chainId: number | string): PaymentPolicy | null;
export function getReservePolicy(chainId: number | string): ReservePolicy | null;
export function getOracle(chainId: number | string, key: string): OracleConfig | null;
export function getWrappedNative(chainId: number | string): TokenInfo | null;
export function validateChainConfig(config: unknown): ChainConfig;
