import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {Button, Icon} from 'react-materialize'
import {CardPanel, Input, Row} from 'react-materialize'

import { sendRawTx } from '../actions'

import ethunit from 'ethjs-unit'
import EthereumTx from 'ethereumjs-tx'


class SendTx extends Component {
  txDataInput: null;
  txToAddress: null;
  txValue: null;
  txPrivkey: null;
  txNonce: null;
  //state = { storageExpanded: false };

  static propTypes = {
    defaultFromAddress: PropTypes.string,
    txCountByAccount: PropTypes.object
    //address: PropTypes.string.isRequired,
    //balance: PropTypes.object,
    //txCount: PropTypes.object,
    //storage: PropTypes.object,
    //code: PropTypes.string
  }

  handleSendTxDataChange = e => {
    // TODO: validate '0x' prefix
    console.log('handleSendTxDataChange this.txDataInput:', this.txDataInput.input.value)
  }

  handleSendTxSubmit = e => {
    console.log('handleSendTxSubmit this.txDataInput:', this.txDataInput.input.value)
    console.log('this.txPrivkey:', this.txPrivkey.input.value)
    const privateKey = Buffer.from(this.txPrivkey.input.value.substr(2), 'hex')

    const txValue = ethunit.toWei(this.txValue.input.value, 'ether').toString('hex')
    const txParams = {
      nonce: '0x' + this.txNonce.toString('hex'),
      gasPrice: '0x01',
      gasLimit: '0x1e8480',
      to: this.txToAddress.input.value, 
      value: '0x' + txValue,
      data: this.txDataInput.input.value,
      chainId: 66, // ewasm testnet chainId
    }
    console.log('txParams:', txParams)

    const tx = new EthereumTx(txParams)
    tx.sign(privateKey)
    const serializedTx = tx.serialize()
    console.log('serializedTx:', serializedTx.toString('hex'))

    // could connect() this component using react-redux and map this
    // action to a prop using mapDispatchToProps but keep it simple for now
    sendRawTx(serializedTx.toString('hex'))
    // TODO: add toast notifier for "tx hash"
  }


  render() {
    console.log('SendTx component render props:', this.props)
    const { defaultFromAddress, txCountByAccount} = this.props

    console.log('txCountByAccount:', txCountByAccount)
    if (txCountByAccount[defaultFromAddress] !== undefined) {
      this.txNonce = txCountByAccount[defaultFromAddress]
    }


    return (

      <CardPanel className="blue-grey lighten-5 black-text">
        <Row>
          <Input s={9} label="Privkey" validate
            ref={node => { this.txPrivkey = node }}
            defaultValue='0x22841708f94778e47ffec5bdd6bff68a1becc473a1026d49fc0c03a7cbe9d330' />
        </Row>

        <Row>
          <Input s={7} label="To:" validate
            ref={node => { this.txToAddress = node }}
            defaultValue='0x3f04aef42126a9a82053069ed8c73671300e40a5' />

          <Input s={2} label="Value (ETH):" validate
            ref={node => { this.txValue = node }}
            defaultValue='0' />
        </Row>

        <Row>
          <Input s={12} type='textarea' label="Data (bytes or wast):"
            defaultValue='0x...'
            ref={node => { this.txDataInput = node }}
            onChange={this.handleSendTxDataChange}
          />
        </Row>

        <div className="right-align">
          <Button waves='light' className='red' onClick={this.handleSendTxSubmit}>Send tx<Icon right>send</Icon></Button>
        </div>
      </CardPanel>
    )

  }
}

export default SendTx
