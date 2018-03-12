import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { connectToRpc, addAccountsToWatchList } from '../actions'
import Account from '../components/Account'
import SendTx from '../components/SendTx'

import {CardPanel, Collapsible} from 'react-materialize'

//import ethunit from 'ethjs-unit'
import EthereumTx from 'ethereumjs-tx'

console.log('EthereumTx:', EthereumTx)

const defaultRpcUrl = 'http://localhost:8545'

const accountsToWatch = [
  //'0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', // mainnet account
  //'0x7DA90089A73edD14c75B0C827cb54f4248D47eCc' // mainnet account
  // '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b', // testing account, known privkey
  // '0x1000000000000000000000000000000000000000', // example contract
  // '0x2000000000000000000000000000000000000000'
  '0x52ba96a21130b141b61cafbebf6ae38edfa5cdde',
  '0x3f04aef42126a9a82053069ed8c73671300e40a5',
]

// FIXME: kill this and instead derive from privkey of sending account
const FROM_ADDRESS = accountsToWatch[0]


class App extends Component {

  static propTypes = {
    balanceByAccount: PropTypes.object,
    codeByAccount: PropTypes.object,
    storageByAccount: PropTypes.object,

    statusIsConnected: PropTypes.bool,
    accountsWatchList: PropTypes.array,

    dispatch: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { dispatch } = this.props

    dispatch(connectToRpc(defaultRpcUrl))
    dispatch(addAccountsToWatchList(accountsToWatch))
  }

  handleConnect = rpcUrl => {
    this.props.dispatch(connectToRpc(rpcUrl))
  }

  render() {
    let rpcUrlInput
    console.log('this.props:', this.props)

    const { latestBlock } = this.props
    let { accountsWatchList } = this.props
    const { balanceByAccount } = this.props
    const { txCountByAccount } = this.props
    const { codeByAccount } = this.props
    const { storageByAccount } = this.props
    
    if (latestBlock.blockHash === undefined) {
      latestBlock.blockHash = ''
    }

    console.log('render accountsWatchList:', accountsWatchList)
    if (accountsWatchList === undefined) {
      accountsWatchList = []
    }

    let { statusIsConnected } = this.props
    if (statusIsConnected === undefined) {
      statusIsConnected = false;
    }
    console.log('statusIsConnected:', statusIsConnected)
    console.log('latestBlock:', latestBlock)

    return (
      <div className="container">
      
        <CardPanel className="black-text">
        <div>
          <span>
            Block number: { latestBlock.blockNumber }
          </span>
          &nbsp;&nbsp;
          <span>
            hash: { latestBlock.blockHash.substr(0,10) + '...' + latestBlock.blockHash.substr(latestBlock.blockHash.length - 8) }
          </span>
        </div>

        <br/>

        <div>
          Status: { statusIsConnected ? 'Connected' : 'not connected' }
        </div>

        <div>
          <form
          onSubmit={e => {
            e.preventDefault()
            if (!rpcUrlInput.value.trim()) {
              return
            }
            //dispatch(addTodo(input.value))
            this.handleConnect(rpcUrlInput.value)
          }}
          >

            <div>
                client rpc url:
                <div className="input-field inline">
                  <input defaultValue={defaultRpcUrl}
                    ref={node => { rpcUrlInput = node }}
                  />
                </div>
                <button type="submit"> Connect </button>
            </div>

          </form>
        </div>
        </CardPanel>

        <div>
          Send transaction:
          <SendTx txCountByAccount={txCountByAccount} defaultFromAddress={FROM_ADDRESS} dispatch={this.props.dispatch}/>
        </div>

        <br/>

        <div>
          Accounts:
          <Collapsible>
            {accountsWatchList.map((accountAddress, i) =>
              <Account  key={i}
                        address={accountAddress}
                        balance={balanceByAccount[accountAddress]}
                        txCount = {txCountByAccount[accountAddress]}
                        storage={storageByAccount[accountAddress]}
                        code={codeByAccount[accountAddress]}
              />
            )}
          </Collapsible>
        </div>

      </div>
    )
  }
}

const mapStateToProps = state => {
  console.log('mapStateToProps state:', state)
  //const { statusIsConnected } = state
  const { latestBlock } = state
  /*
  const { blockNumber, blockHash } = state
  const latestBlock = {
    blockNumber: blockNumber,
    blockHash: blockHash
  }
  */

  // TODO: status should be state.statusIsConnected, not state.latestBlock.statusIsConnected
  const { statusIsConnected } = latestBlock

  const { storageByAccount } = state
  const { codeByAccount } = state
  const { balanceByAccount } = state
  const { txCountByAccount } = state
  let { accountsWatchList } = state
  accountsWatchList = accountsWatchList.accountsWatchList


  return {
    statusIsConnected,
    latestBlock,
    accountsWatchList,
    balanceByAccount,
    txCountByAccount,
    codeByAccount,
    storageByAccount
  }
}

export default connect(mapStateToProps)(App)
