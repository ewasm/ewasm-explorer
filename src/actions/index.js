//import { eth, rpc } from '../eth-rpc.js'
import { ethQuery } from '../eth-rpc.js'

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'

export const selectSubreddit = subreddit => ({
  type: SELECT_SUBREDDIT,
  subreddit
})

export const invalidateSubreddit = subreddit => ({
  type: INVALIDATE_SUBREDDIT,
  subreddit
})

export const requestPosts = subreddit => ({
  type: REQUEST_POSTS,
  subreddit
})

export const receivePosts = (subreddit, json) => ({
  type: RECEIVE_POSTS,
  subreddit,
  posts: json.data.children.map(child => child.data),
  receivedAt: Date.now()
})

const fetchPosts = subreddit => dispatch => {
  dispatch(requestPosts(subreddit))
  return fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(subreddit, json)))
}

const shouldFetchPosts = (state, subreddit) => {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

export const fetchPostsIfNeeded = subreddit => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), subreddit)) {
    return dispatch(fetchPosts(subreddit))
  }
}


/*** eth actions ***/

export const LATEST_BLOCK = 'LATEST_BLOCK'
export const NEW_BLOCK = 'NEW_BLOCK'
export const RPC_ERROR = 'RPC_ERROR'
export const RECEIVE_STORAGE = 'RECEIVE_STORAGE'
export const RECEIVE_CODE = 'RECEIVE_CODE'
export const RECEIVE_BALANCE = 'RECEIVE_BALANCE'
export const RECEIVE_TX_COUNT = 'RECEIVE_TX_COUNT'
export const SET_ACCOUNTS_LIST = 'SET_ACCOUNTS_LIST'

export const receiveLatestBlock = block => ({
  type: LATEST_BLOCK,
  block
})

export const rpcError = () => ({
  type: RPC_ERROR
})


export const receiveStorage = (accountAddress, storageDump) => ({
  type: RECEIVE_STORAGE,
  accountAddress: accountAddress,
  storageDump: storageDump
})

export const receiveCode = (accountAddress, code) => ({
  type: RECEIVE_CODE,
  accountAddress: accountAddress,
  code: code
})

export const receiveBalance = (accountAddress, balance) => ({
  type: RECEIVE_BALANCE,
  accountAddress: accountAddress,
  balance: balance
})

export const receiveTxCount = (accountAddress, txCount) => ({
  type: RECEIVE_TX_COUNT,
  accountAddress: accountAddress,
  txCount: txCount
})


export const setWatchList = (accountAddresses) => ({
  type: SET_ACCOUNTS_LIST,
  accountAddresses: accountAddresses,
})



export const onNewBlock = block => (dispatch, getState) => {
  console.log('onNewBlock:', block)
  //const contractAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
  let accountsWatchList = getState().accountsWatchList.accountsWatchList
  console.log('onNewBlock accountsWatchList:', accountsWatchList)
  if (accountsWatchList === undefined) {
    accountsWatchList = []
  }
  //.addressWatchList
  
  
  for (let address of accountsWatchList) {
    console.log('onNewBlock getting code and storage for address:', address)
    dispatch(getAccountBalance(address))
    dispatch(getTransactionCount(address))
    dispatch(getAccountCode(address))
    dispatch(getAccountStorage(address, block.hash))
  }
}



export const getLatestBlock = () => (dispatch, getState) => {
  console.log('getLatestBlock action called.')
  //ethQuery.eth.getBlockByNumber(5058000, false)
  ethQuery.eth.getBlockByNumber("latest", false)
    .then(block => {
      console.log('got latest block:', block)
      console.log('block number:', block.number.toNumber())
      //dispatch(receiveLatestBlock(block.number.toNumber()))

      const state = getState()
      if (state.latestBlock) {
        console.log('last block number:', state.latestBlock.blockNumber)
        if (state.latestBlock.blockNumber !== block.number.toNumber()) {
          dispatch(onNewBlock(block))
          //getStorage(block.hash)
        }
      }

      dispatch(receiveLatestBlock(block))
      setTimeout(function() {
        dispatch(getLatestBlock())
      }, 10000);

    }).catch(err => {
      console.log('getBlockByNumber rpc error:', err)
      dispatch(rpcError())
    })
}



export const connectToRpc = rpcUrl => (dispatch, getState) => {
  console.log('connectToRpc action called. rpcUrl:', rpcUrl)
  ethQuery.connect(rpcUrl)
  dispatch(getLatestBlock())
}


export const addAccountsToWatchList = accountsList => (dispatch, getState) => {
  console.log('addAccountsToWatchList action called. accountsList:', accountsList)
  let currentAccountList = getState().accountsWatchList.accountsWatchList
  if (currentAccountList === undefined) {
    currentAccountList = []
  }
  console.log('currentAccountList:', currentAccountList)
  const listWithDups = currentAccountList.concat(accountsList)
  const uniqueList = [...new Set(listWithDups)]
  //ethQuery.connect(rpcUrl)
  dispatch(setWatchList(uniqueList))
}




export const getAccountStorage = (accountAddress, blockHash) => (dispatch, getState) => {
  console.log('getAccountStorage action called.')

  ethQuery.rpc.sendAsync({
    method: 'debug_storageRangeAt',
    params: [blockHash, 0, accountAddress, '0x', 100],
  }, (err, result) => {
    console.log('storageRangeAt err:', err);
    console.log('storageRangeAt result:', result);
    //let storageSlots = Object.keys(result.storage);
    //let sortedSlots = sortStorage(storageSlots, result.storage);
    if (result.storage) {
      dispatch(receiveStorage(accountAddress, result.storage))
    } else {
      console.log('ERROR! result.storage undefined')
    }
    // null '0x5483de922'
  });
}


export const getAccountCode = accountAddress => (dispatch, getState) => {
  console.log('getAccountCode action called.')

  ethQuery.eth.getCode(accountAddress, "latest")
  .then((result) => {
    console.log('got code result:', result)
    dispatch(receiveCode(accountAddress, result))
  }).catch((err) => {
    console.log('getAccountCode rpc error:', err)
    dispatch(rpcError())
  })
}


export const getAccountBalance = accountAddress => (dispatch, getState) => {
  console.log('getAccountBalance action called.')

  ethQuery.eth.getBalance(accountAddress, "latest")
  .then((result) => {
    console.log('got balance result:', result)
    dispatch(receiveBalance(accountAddress, result))
  }).catch((err) => {
    console.log('getAccountBalance rpc error:', err)
    dispatch(rpcError())
  })
}



export const getTransactionCount = accountAddress => (dispatch, getState) => {
  console.log('getTransactionCount action called.')

  ethQuery.eth.getTransactionCount(accountAddress, "latest")
  .then((result) => {
    console.log('got transaction count result:', result)
    dispatch(receiveTxCount(accountAddress, result))
  }).catch((err) => {
    console.log('getTransactionCount rpc error:', err)
    dispatch(rpcError())
  })
}


export const sendRawTx = rawTx => (dispatch, getState) => {
  console.log('sendRawTx action called.')
  
  ethQuery.eth.sendRawTransaction(rawTx)
  .then((result) => {
    console.log('got sendRawTransaction result:', result)
    //dispatch(receiveBalance(accountAddress, result))
  }).catch((err) => {
    console.log('sendRawTransaction rpc error:', err)
    dispatch(rpcError())
  })

}
