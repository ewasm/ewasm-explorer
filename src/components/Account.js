//import React from 'react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {Button, Icon, Badge} from 'react-materialize'
//import { Collapsible } from 'react-materialize'
import {CollapsibleItem} from 'react-materialize'

import BN from 'bn.js'
import ethunit from 'ethjs-unit'

import wabt from 'wabt'

console.log('wabt:', wabt)

function hex2buf (hex) {
  let typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  return typedArray;
}


/*
let testWast = `
(module
  (func $addTwo (param i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.add)
  (export "addTwo" (func $addTwo)))
`;

let testWasm = "0061736d0100000001070160027f7f017f03020100070a010661646454776f00000a09010700200020016a0b0019046e616d65010901000661646454776f020701000200000100";


let binContents = hex2buf(testWasm);

console.log('binContents:', binContents);

let textmodule = wabt.readWasm(binContents, {readDebugNames: true});
textmodule.generateNames();
textmodule.applyNames();
let wasmAsWast = textmodule.toText({foldExprs: true, inlineExport: true});
console.log('wasmAsWast:', wasmAsWast)
*/


function wasm2wast(wasmBytecode) {
  let wasmBuf = hex2buf(wasmBytecode);
  console.log('wasmBuf:', wasmBuf);
  let textmodule = wabt.readWasm(wasmBuf, {readDebugNames: true});
  textmodule.generateNames();
  textmodule.applyNames();
  let wasmAsWast = textmodule.toText({foldExprs: true, inlineExport: true});
  return wasmAsWast
}

function sortStorage(slots, storage) {
  function sortByHex(a, b) {
    return storage[a]['key'] - storage[b]['key']
  }

  return slots.sort(sortByHex)
}

class Account extends Component {

  static propTypes = {
    address: PropTypes.string.isRequired,
    balance: PropTypes.object,
    txCount: PropTypes.object,
    storage: PropTypes.object,
    code: PropTypes.string
  }

  state = { storageExpanded: false };

  constructor(props) {
    super(props);
    this.handleExpandStorage = this.handleExpandStorage.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect (key) {
    const { onSelect } = this.props;

    if (onSelect) { onSelect(key); }

    if (this.state.activeKey === key) { key = null; }

    if (this.props.accordion) {
      this.setState({ activeKey: key });
    }
  }

  handleExpandStorage() {
    console.log('handleExpandStorage. storageExpanded:', this.state.storageExpanded)
    this.setState({ storageExpanded: !this.state.storageExpanded });
  }

  render() {
    console.log('Account component render props:', this.props)
    const { address } = this.props
    let { storage } = this.props
    let { balance } = this.props
    let { txCount } = this.props
    let { code } = this.props

    console.log('account nonce:', txCount)

    if (txCount === undefined) {
      txCount = new BN(0)
    }

    console.log('account balance:', balance)
    
    if (balance === undefined) {
      balance = new BN(0)
    }

    console.log('Account.js rendering account:', address)
    console.log('account storage:', storage)
    if (storage === undefined) {
      storage = {}
      // return (<div><span>{address}</span></div>)
    }

    if (code === undefined) {
      code = "";
    }

    let storageSlots = Object.keys(storage);
    let sortedSlots = sortStorage(storageSlots, storage);

    const fullStorageSlotCount = sortedSlots.length

    if (this.state.storageExpanded === false) {
      sortedSlots = sortedSlots.slice(0, 5)
    }

    const EWASM_BYTES = '0x0061736d01'

    let ewasmOrEVM = 'EVM'
    let isEwasm = false

    if (code.substring(0,12) === EWASM_BYTES) {
      ewasmOrEVM = 'ewasm'
      isEwasm = true
      code = wasm2wast(code.substr(2))
      console.log('got wast code:', code)
    }

    if (code.length === 2) {
      ewasmOrEVM = ''
    }

    let accountTypeBadge = 
      <div><Badge newIcon data-badge-caption="">{ewasmOrEVM} contract</Badge></div>

    if (code.length === 2) {
      accountTypeBadge = <div></div>
    }


    let accountHeader =
      <div className="accountHeaderDiv">
        <div>{address}</div>
        {accountTypeBadge}
      </div>


    let storageExpandOrHideButton = null
    if (this.state.storageExpanded === false) {
      storageExpandOrHideButton = 
        <div className="center-align">
          <span>.....</span>
          <br/>
          <Button waves='light' flat className="storageExpandButton inactive" onClick={this.handleExpandStorage}>
            View all storage keys<Icon right>expand_more</Icon>
          </Button>
        </div>
    } else {
      storageExpandOrHideButton =
        // show button to collapse storage
        <div className="center-align">
          <Button waves='light' flat className="storageExpandButton active" onClick={this.handleExpandStorage}>
            Hide storage keys<Icon right>expand_more</Icon>
          </Button>
        </div>
    }

    return (

      <CollapsibleItem
        key={this.props.key}
        onSelect={this.handleSelect}
        header={accountHeader}
        icon='expand_more'
        iconClassName='right'>

      <div className="accountDiv">

        <span>Balance:</span> {ethunit.fromWei(balance, 'ether').toString()} ether

        <div className="divider"></div>

        <span>Nonce:</span> { txCount.toNumber() }

        <div className="divider"></div>

        <span>Storage:</span>
        <div className="storageDiv">
          {sortedSlots.map((slotHash, i) =>
            <div key={i}>
              {storage[slotHash].key} &nbsp;&nbsp;&nbsp; {storage[slotHash].value}
            </div>
          )}
        </div>
        {fullStorageSlotCount > 5 ? 
          storageExpandOrHideButton
        : <div></div>}

        <div className="divider"></div>

        <span>Code:</span>
        <div className="accountCode">
          {isEwasm === true ? code
          : code.substring(0,256) + "....." + code.substring(code.length - 64)}
        </div>
      </div>

      </CollapsibleItem>
    )

  }
}

export default Account
