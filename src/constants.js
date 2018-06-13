export const DEFAULT_RPC_URL = 'http://localhost:8545'

export const ACCOUNTS_TO_WATCH = [
  //'0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', // mainnet account
  //'0x7DA90089A73edD14c75B0C827cb54f4248D47eCc' // mainnet account
  // '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b', // testing account, known privkey
  // '0x1000000000000000000000000000000000000000', // example contract
  // '0x2000000000000000000000000000000000000000'
  '0x52ba96a21130b141b61cafbebf6ae38edfa5cdde',
  '0x3f04aef42126a9a82053069ed8c73671300e40a5',
]

// FIXME: kill this and instead derive from privkey of sending account
export const FROM_ADDRESS = ACCOUNTS_TO_WATCH[0]

