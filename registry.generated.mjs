// AUTO-GENERATED from chains/*.json; edit JSON and run npm run generate.
export default [
  {
    "schemaVersion": 1,
    "chainId": 56,
    "slug": "bsc-mainnet",
    "name": "BNB Smart Chain Mainnet",
    "nativeCurrency": {
      "symbol": "BNB",
      "decimals": 18,
      "icon": "bnb"
    },
    "tokens": {
      "WBNB": {
        "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "symbol": "WBNB",
        "decimals": 18,
        "icon": "bnb"
      },
      "USDT": {
        "address": "0x55d398326f99059fF775485246999027B3197955",
        "symbol": "USDT",
        "decimals": 18,
        "icon": "usdt"
      },
      "USDC": {
        "address": "0x8AC76a51cc950d9822D68b83Fe1Ad97B32Cd580d",
        "symbol": "USDC",
        "decimals": 18,
        "icon": "usdc"
      },
      "BUSD": {
        "address": "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "symbol": "BUSD",
        "decimals": 18,
        "icon": "busd"
      },
      "ETH": {
        "address": "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        "symbol": "ETH",
        "icon": "eth"
      },
      "BTCB": {
        "address": "0x7130d2a12b9bcbbfae4f2634d864a1ee1ce3ead9",
        "symbol": "BTCB",
        "icon": "btc"
      }
    },
    "contracts": {
      "wrappedNative": "WBNB"
    },
    "oracles": {
      "BNB_USD": {
        "address": "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
        "adapter": "chainlink-aggregator-v3"
      }
    },
    "payments": {
      "directAssets": [
        "WBNB",
        "USDT",
        "USDC"
      ],
      "dynamicTribeToken": true,
      "dynamicQuoteToken": true,
      "fallbackSwapAsset": "WBNB"
    },
    "reserve": {
      "displayAssets": [
        "WBNB",
        "USDT",
        "USDC"
      ],
      "dynamicTribeToken": true,
      "dynamicQuoteToken": true
    },
    "valuation": {
      "nativeOracle": "BNB_USD",
      "stablecoinCandidates": [
        "USDT",
        "USDC"
      ],
      "assumeTestnetRealUsd": false,
      "simulatedQuoteAssets": []
    },
    "capabilities": {
      "payments": true,
      "reserve": true,
      "valuation": true
    },
    "environment": "mainnet"
  },
  {
    "schemaVersion": 1,
    "chainId": 97,
    "slug": "bsc-testnet",
    "name": "BNB Smart Chain Testnet",
    "nativeCurrency": {
      "symbol": "BNB",
      "decimals": 18,
      "icon": "bnb"
    },
    "tokens": {
      "WBNB": {
        "address": "0xae13d989daC2f0dEbff460aC112a837C89BAa7cd",
        "symbol": "WBNB",
        "decimals": 18,
        "icon": "bnb"
      },
      "USDT": {
        "address": "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd",
        "symbol": "USDT",
        "icon": "usdt"
      },
      "USDC": {
        "address": "0x64544969ed7ebf5f083679233325356ebe738930",
        "symbol": "USDC",
        "icon": "usdc"
      },
      "BTCB": {
        "address": "0x6ce8da28e2f864420840cf74474eff5fd80e65b8",
        "symbol": "BTCB",
        "icon": "btc"
      },
      "BUSD": {
        "address": "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
        "symbol": "BUSD",
        "icon": "busd"
      },
      "ETH": {
        "address": "0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378",
        "symbol": "ETH",
        "icon": "eth"
      },
      "DAI": {
        "address": "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867",
        "symbol": "DAI",
        "icon": "dai"
      },
      "USDC_FAUCET": {
        "address": "0xa8802f96cad0d45343d9bc660b6f7d80050a660b",
        "symbol": "USDC",
        "icon": "usdc"
      },
      "USDT_FAUCET": {
        "address": "0xe935d9c9c24d02e61186c640cc01d713c876d40f",
        "symbol": "USDT",
        "icon": "usdt"
      }
    },
    "contracts": {
      "wrappedNative": "WBNB"
    },
    "oracles": {
      "BNB_USD": {
        "address": "0x1A26d803C2e796601794f8C5609549643832702C",
        "adapter": "binance-oracle-aggregator-v3"
      }
    },
    "payments": {
      "directAssets": [
        "WBNB",
        "USDT",
        "USDC"
      ],
      "dynamicTribeToken": true,
      "dynamicQuoteToken": true,
      "fallbackSwapAsset": "WBNB"
    },
    "reserve": {
      "displayAssets": [
        "WBNB",
        "USDT",
        "USDC"
      ],
      "dynamicTribeToken": true,
      "dynamicQuoteToken": true
    },
    "valuation": {
      "nativeOracle": "BNB_USD",
      "stablecoinCandidates": [],
      "assumeTestnetRealUsd": false,
      "simulatedQuoteAssets": [
        "USDT",
        "USDC"
      ]
    },
    "capabilities": {
      "payments": true,
      "reserve": true,
      "valuation": true
    },
    "environment": "testnet"
  }
];
