import { combineReducers } from 'redux'
import {
  SELECT_SUBREDDIT, INVALIDATE_SUBREDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
} from '../actions'


import {
  LATEST_BLOCK,
  SET_ACCOUNTS_LIST,
  RECEIVE_STORAGE,
  RECEIVE_CODE,
  RECEIVE_BALANCE,
  RECEIVE_TX_COUNT,
  RPC_ERROR,
} from '../actions'

// https://redux.js.org/docs/recipes/StructuringReducers.html


const selectedSubreddit = (state = 'reactjs', action) => {
  switch (action.type) {
    case SELECT_SUBREDDIT:
      return action.subreddit
    default:
      return state
  }
}

const posts = (state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
      return {
        ...state,
        didInvalidate: true
      }
    case REQUEST_POSTS:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_POSTS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default:
      return state
  }
}

const postsBySubreddit = (state = { }, action) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return {
        ...state,
        [action.subreddit]: posts(state[action.subreddit], action)
      }
    default:
      return state
  }
}



/******     ******/




const latestBlock = (state = { }, action) => {
  console.log('reducer latestBlock action:', action)
  switch (action.type) {
    case LATEST_BLOCK:
      return {
        ...state,
        blockNumber: action.block.number.toNumber(),
        blockHash: action.block.hash,
        statusIsConnected: true
      }
    default:
      return state
  }
}


const accountsWatchList = (state = { accountsWatchList: [] }, action) => {
  console.log('reducer accountsWatchList action:', action)
  switch (action.type) {
    case SET_ACCOUNTS_LIST:
      //console.log('reducers accountsWatchList action:', action)
      return {
        ...state,
        accountsWatchList: action.accountAddresses
      }
    default: 
      return state
  }
}


/*
const statusIsConnected = (state = { }, action) => {
  console.log('reducer statusIsConnected. action:', action)
  switch (action.type) {
    case RPC_ERROR:
      console.log('reducers RPC_ERROR action:', action)
      return {
        ...state,
        statusIsConnected: false
      }
    default:
      return {
        ...state,
        statusIsConnected: false
      }
  }
}
*/



const storageByAccount = (state = { }, action) => {
  switch (action.type) {
    case RECEIVE_STORAGE:
      console.log('storageByAccount RECEIVE_STORAGE:', action)
      return {
        ...state,
        [action.accountAddress]: action.storageDump
      }
    default:
      return state
  }
}


const codeByAccount = (state = { }, action) => {
  switch (action.type) {
    case RECEIVE_CODE:
      console.log('codeByAccount RECEIVE_CODE:', action)
      return {
        ...state,
        [action.accountAddress]: action.code
      }
    default:
      return state
  }
}



const balanceByAccount = (state = { }, action) => {
  switch (action.type) {
    case RECEIVE_BALANCE:
      console.log('balanceByAccount RECEIVE_BALANCE:', action)
      return {
        ...state,
        [action.accountAddress]: action.balance
      }
    default:
      return state
  }
}


const txCountByAccount = (state = { }, action) => {
  switch (action.type) {
    case RECEIVE_TX_COUNT:
      console.log('txCountByAccount RECEIVE_TX_COUNT:', action)
      return {
        ...state,
        [action.accountAddress]: action.txCount
      }
    default:
      return state
  }
}





const rootReducer = combineReducers({
  //...statusIsConnected,
  latestBlock,
  storageByAccount,
  codeByAccount,
  balanceByAccount,
  txCountByAccount,
  accountsWatchList,

  /*** ****/
  postsBySubreddit,
  selectedSubreddit
})

export default rootReducer
