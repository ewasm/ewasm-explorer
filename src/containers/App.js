import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { connectToRpc, addAccountsToWatchList } from '../actions'
import Account from '../components/Account'
import SendTx from '../components/SendTx'

import { DEFAULT_RPC_URL, FROM_ADDRESS } from '../constants'

import {CardPanel, Collapsible} from 'react-materialize'

import EthereumTx from 'ethereumjs-tx'

console.log('EthereumTx:', EthereumTx)


class App extends Component {

  static propTypes = {
    balanceByAccount: PropTypes.object,
    codeByAccount: PropTypes.object,
    storageByAccount: PropTypes.object,
    statusIsConnected: PropTypes.bool,
    accountsWatchList: PropTypes.array,
  }

  componentDidMount() {
    this.props.connectToRpc()
    this.props.addAccountsToWatchList()
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
            this.props.connectToRpc(rpcUrlInput.value)
          }}
          >

            <div>
                client rpc url:
                <div className="input-field inline">
                  <input defaultValue={DEFAULT_RPC_URL}
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
  // TODO: status should be state.statusIsConnected, not state.latestBlock.statusIsConnected
  return {
    statusIsConnected: state.latestBlock.statusIsConnected,
    latestBlock: state.latestBlock,
    accountsWatchList: state.accountsWatchList.watchList,
    balanceByAccount: state.balanceByAccount,
    txCountByAccount: state.txCountByAccount,
    codeByAccount: state.codeByAccount,
    storageByAccount: state.storageByAccount,
  }
}
const mapDispatchToProps = {
  connectToRpc,
  addAccountsToWatchList,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

