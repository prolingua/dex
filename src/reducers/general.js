import produce from "immer";
import moment from 'moment';

import actions from "actions";
import { DeepCleanObject } from "common/helpers";

const { constants } = actions;

// do this only if logged out
// forces app to recognise first time visit to a /foo page when logged out

var url = window.location.pathname;
var destination = url.replace("/", "");
var useDestination = destination !== undefined && destination !== "";
// history.listen(location => {

//   //var url = location.pathname;
//   //var urlArray = url.split('/');
//   //var intendedPage = urlArray[1];
//   window.location = location.pathname;
//   useDestination = true;
//   destination = location.pathname;
// });

const INITIAL_STATE = {
  version: "1.0.0",
  env: "local",
  page: useDestination ? destination : "",
  dimmer: false,
  menu: {
    open: true // can make this dynamic based on screen size,
  },

  blockchain: {
    web3: null,
    token: null,
    tokenAddress: "",
    exchange: null,
    exchangeAddress: "",
    account:"",
    networkId: 0,
    startingBlockchainData: false,
    startingDepositing: false,
    startingWithdrawing: false,
    startingMakingOrder: false,
    startingFillingOrder:false,
    startingStartingOrder:false,
    startingSendingDapp: false,
    dappRecipientAddress: "",
    tradedOrders: [],
    tradedDappEthOrders: [],
    tradedEthDappOrders: [],
    availableOrders: [],
    availableDappEthOrders: [],
    availableEthDappOrders: [],
    myAvailableDappEthOrders: [],
    myAvailableEthDappOrders: [],

    myCancelledDappEthOrders: [],
    myCancelledEthDappOrders: [],

    myTradedDappEthOrders: [],
    myTradedEthDappOrders: [],

    myFullfilledDappEthOrders: [],
    myFullfilledEthDappOrders: [],

    fillableDappEthOrders: [],
    fillableEthDappOrders: [],
    tokenDepositAmount: 0,
    etherDepositAmount: 0,
    tokenWithdrawAmount: 0,
    etherWithdrawAmount: 0,
    tokenOrderAmount: 0,
    etherOrderAmount: 0,
    tokenSendAmount: 0,
    allowance:0,


    buyOrderOrder :{ amount : 0, price: 0 },
    sellOrder: { amount: 0, price: 0 },
    showOrderBook : true,
    orderBook: { sellOrders:[{id:1, orderFillAction:'Sell', tokenAmount: 2, tokenPrice: 5, etherAmount:10, orderTypeClass:'danger'}], 
                  buyOrders:[{id:2, orderFillAction:'Buy', tokenAmount: 3, tokenPrice: 6, etherAmount:20, orderTypeClass: 'success'}] },
    priceChartLoaded: true,
    priceChart : { series: [], lastPriceChange: 3, lastPrice: 2, lastPriceChange:'+'},
    
    loadingOrders: false,
    
  },

  modal: {
    open: false,
    formMode: "",
    header: "",
    content: "",
    size: "small",
    loading: false,
    secondaryClickModal: "",
  },

  generalData: {},
  // these are dynamically added
  loading: {
  },

  // a dynamically built object for adding messages to screen contextually
  message: {

  },

  // DATA
  user: {
    id: "",
    email: "",
    phone: "",
    password: ""
  },

  auth: {
    accessToken: "",
    accessTokenExpiry: "",
    isLoggedIn: false,

    emailConfirmToken: "",
    passwordResetToken: "",

    newPassword: "",
    confirmPassword: ""
  },

  sites: [],
  selectedSiteId: 0,

  checkpoints: [],
  selectedCheckpointId: 0,

  checkpointGroups: [],
  checkpointGroup: {},
  selectedCheckpointGroupId: 0,

  // FOR THE PAGE /tests
  testData: [],
  testDataSelected: {
  },
};

const { resetState } = constants;
const { logout } = constants;
const { changePage } = constants;
const { changeState } = constants;
const { updateInitialState } = constants;
const { reRender } = constants;

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {

    case resetState: {
      var currentPage = window.location.pathname;

      return {
        ...INITIAL_STATE,
        page: currentPage
      };
    }

    /* case logout: {
      return {
        ...state
      };
    } */

    case logout: {
      return {
        ...INITIAL_STATE,
      };
    }

    case updateInitialState: {

      return {
        ...state
      }
    }

    case changePage: {
      if (action.data.indexOf("https") > -1) {
        //window.location.href = action.data;
        window.open(action.data, '_blank');
      }
      else if (action.data === "reload") {
        window.location.reload(true);
      }
      else {
        window.history.pushState({}, '', action.data);
      }

      return {
        ...state,
        page: action.data
      };
    }

    case reRender: {
      return {
        ...state,
        reRendered: Date.now()
      };
    }

    case changeState: {

      let items = action.data.items;

      var hasToken = state.user?.auth?.accessToken !== "";
      if (hasToken) {
        let now = moment();
        let expiry = moment(state.user?.auth?.accesssTokenExpiration);
        if (now > expiry) {
        }
      
      }

      if (items.length === 1 && items[0].path[0] === "version") {
        let merge = Object.assign(INITIAL_STATE, state);

        return {
          ...merge,
          version: items[0].value
        };
      }

      return produce(state, draft => {

        for (let i = 0; i < items.length; i++) {
          let path = items[i].path;
          let value = items[i].value;
          let arrayInfo = items[i].arrayInfo;

          switch (path.length) {
            case 1:
              if (arrayInfo !== undefined) {
                let action = arrayInfo.action;

                if (action === "add") {
                  draft[path[0]].push(value);
                }

                if (action === "modify") {
                  let index = arrayInfo.index;
                  let fieldName = Object.keys(value)[0];
                  draft[path[0]][index][fieldName] = value[fieldName];
                }

                if (action === "remove") {
                  let index = arrayInfo.index;
                  draft[path[0]].splice(index, 1);
                }
              }
              else {
                draft[path[0]] = value;
              }

              break;

            case 2:
              if (arrayInfo !== undefined) {
                let action = arrayInfo.action;

                if (action === "add") {
                  draft[path[0]][path[1]].push(value);
                }

                if (action === "modify") {
                  let index = arrayInfo.index;
                  let fieldName = Object.keys(value)[0];
                  draft[path[0]][path[1]][index][fieldName] = value[fieldName];
                }

                if (action === "remove") {
                  let index = arrayInfo.index;
                  draft[path[0]][path[1]].splice(index, 1);
                }
              }
              else {
                draft[path[0]][path[1]] = value;
              }

              break;

            case 3:
              if (arrayInfo !== undefined) {
                let action = arrayInfo.action;

                if (action === "add") {
                  draft[path[0]][path[1]][path[2]].push(value);
                }

                if (action === "modify") {
                  let index = arrayInfo.index;
                  let fieldName = Object.keys(value)[0];
                  draft[path[0]][path[1]][path[2]][index][fieldName] = value[fieldName];
                }

                if (action === "remove") {
                  let index = arrayInfo.index;
                  draft[path[0]][path[1]][path[2]].splice(index, 1);
                }
              }
              else {
                draft[path[0]][path[1]][path[2]] = value;
              }

              break;

            case 4:
              if (arrayInfo !== undefined) {
                let action = arrayInfo.action;

                if (action === "add") {
                  draft[path[0]][path[1]][path[2]][path[3]].push(value);
                }

                if (action === "modify") {
                  let index = arrayInfo.index;
                  let fieldName = Object.keys(value)[0];
                  draft[path[0]][path[1]][path[2]][path[3]][index][fieldName] = value[fieldName];
                }

                if (action === "remove") {
                  let index = arrayInfo.index;
                  draft[path[0]][path[1]][path[2]][path[3]].splice(index, 1);
                }
              }
              else {
                draft[path[0]][path[1]][path[2]][path[3]] = value;
              }

              break;

            default:
              throw new Error(`changeState does not deal with path of length ${path.length}`);
          }
        }
      });
    }

    default:
      if (!action.type.includes('@@')) {
        console.log(`No action for: ${action.type} type`);
      }

      return state;
  }
}
