
const HttpProvider = require('ethjs-provider-http');
const EthRPC = require('ethjs-rpc');
const Eth = require('ethjs-query');


class RpcProvider {
  connect(rpcUrl) {
    console.log('Rpc provider connect rpcUrl:', rpcUrl)
    const EthProvider = new HttpProvider(rpcUrl)
    this.rpc = new EthRPC(EthProvider);
    this.eth = new Eth(EthProvider);
  }
}

export const ethQuery = new RpcProvider()

/*
const HttpProvider = require('ethjs-provider-http');
const EthRPC = require('ethjs-rpc');
const Eth = require('ethjs-query');

//const EthProvider = new HttpProvider('http://localhost:9546')
//export const rpc = new EthRPC(EthProvider);
//export const eth = new Eth(EthProvider);
*/
