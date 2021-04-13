import { DisplayInfoDialog } from "./helpers";

// the complete description of how a model can look to GET,POST,PATCH,DELETE,PUT the REST API
// if you can understand this, you can handle all the possible data calls in the app
// do so by copying this model model and passing into GET, POST, PUT, PATCH, DELETE
var _apiInfoModel = {
  endpoint: {
    url: ``,
    token: "",
    data: {}
  },

  loading: "values in general.loading",

  success: {
    message: "modal,text,off",

    // expects to be able to search the data part of the response for the prop names to match array item names
    // e.g.
    // ["path", "in", "state"] will expect returned data from api call to look like this data: { path: { in: { state: "value"} }  }
    // thats just the DATA part of the response so it will still have success:t/f, title:"", message:"" THEN data:{...as above}
    // and this will update react state.general.path.in.state with "value"
    updatePaths: [
      ["path", "in", "state"],
      ["path-2", "in", "state"],
      ["path-n", "in", "state"],
    ],

    // if message is modal, show a custom modal rather than just one showing a text message and close button
    modalForm: {
      content: "PlaceOrder",
      size: "lg"
    },

    resetPaths: [
      { path: ["path", "to", "reset"], value: "newVal" }
    ],
  },

  fail: {
    message: "modal,text,off",

    updatePaths: [
      ["path", "in", "state"],
      ["path-2", "in", "state"],
      ["path-n", "in", "state"],
    ],

    modalForm: {
      content: "PlaceOrder",
      size: "lg"
    }
  },

  error: {
    message: "modal,text,off",

    updatePaths: [
      ["path", "in", "state"],
      ["path-2", "in", "state"],
      ["path-n", "in", "state"],
    ],

    modalForm: {
      content: "PlaceOrder",
      size: "lg"
    }
  },

  // call GET after one of the CRUD operations (usually to refresh a changed data set)
  refreshData: {
    url: `api/`,
    loading: "values in general.loading",
    updatePaths: [
      ["path", "in", "state"],
      ["path-2", "in", "state"],
      ["path-n", "in", "state"],
    ]
  }
};

function EndpointBaseUrls(identifier) {

  var local = {
    api: "https://localhost:5001",
    app: "http://localhost:8054",
    web: "https:/localhost:5004"
  };

  var dev = {
    api: "https://localhost:5001",
    app: "https://app-dev.tectrack.co.uk",
    web: "https://www-dev.tectrack.co.uk"
  };

  var test = {
    api: "https://api-test.tectrack.co.uk",
    app: "https://app-test.tectrack.co.uk",
    web: "https://www-test.tectrack.co.uk"
  };

  var live = {
    api: "https://api.tectrack.co.uk",
    app: "https://app.tectrack.co.uk",
    web: "https://www.tectrack.co.uk"
  };

  var endpoints = { local, dev, test, live }

  var url = window.location.href;

  var env =
    url.indexOf("localhost") > - 1 ? "local" :
      url.indexOf("dev.tectrack.co.uk") > - 1 ? "dev" :
        url.indexOf("test.tectrack.co.uk") > -1 ? "test" :
          "live";

  return endpoints[env][identifier];
}

function Get(apiInfo, dispatchProps) {
  _CallEndpoint(apiInfo, "GET", dispatchProps);
}

function Put(apiInfo, dispatchProps) {
  _CallEndpoint(apiInfo, "PUT", dispatchProps);
}

function Patch(apiInfo, dispatchProps) {
  _CallEndpoint(apiInfo, "PATCH", dispatchProps);
}

function Post(apiInfo, dispatchProps) {
  _CallEndpoint(apiInfo, "POST", dispatchProps);
}

function Delete(apiInfo, dispatchProps) {
  _CallEndpoint(apiInfo, "DELETE", dispatchProps);
}

function _CallEndpoint(apiInfoModel, method, dispatchProps) {

  var info = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiInfoModel.endpoint.token
    },
    method: method,
  };

  if (method === "POST" || method === "PUT" || method === "PATCH") {
    info.body = JSON.stringify(apiInfoModel.endpoint.data);
  }

  var finalUrl = _ConstructEndpointUrl(apiInfoModel.endpoint.url);

  _ToggleLoading(dispatchProps, apiInfoModel.loading, true);

  var stateItemsToChange = [
    { path: ["loading", apiInfoModel.loading], value: false }
  ];

  fetch(finalUrl, info)
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      if(response.refreshAccessToken){
        stateItemsToChange.push({path: ["auth", "accessToken"], value: response.refreshAccessToken});
      }
      if (response.success) {        
        apiInfoModel.success?.updatePaths?.length && _UpdatePathsInStateFromResponse(stateItemsToChange, response, apiInfoModel.success.updatePaths);
        apiInfoModel.success?.message === "modal" && DisplayInfoDialog(dispatchProps, response.title, response.message);
        apiInfoModel.success?.message === "text" && _AddMessageText(stateItemsToChange, apiInfoModel.success.messageProp, response.message );
        apiInfoModel.success?.modalForm && _AddCustomModal(stateItemsToChange, apiInfoModel.success.modalForm);
        apiInfoModel.success?.resetPaths?.length && _ResetPathsInState(stateItemsToChange, apiInfoModel.success.resetPaths);
        _RefreshData(dispatchProps, apiInfoModel);
        apiInfoModel.success?.changePage && _ChangePage(dispatchProps, apiInfoModel.success.changePage);
      }
      else {
        apiInfoModel.fail?.updatePaths?.length && _UpdatePathsInStateFromResponse(stateItemsToChange, response, apiInfoModel.fail.updatePaths);
        apiInfoModel.fail?.message === "modal" && DisplayInfoDialog(dispatchProps, response.title, response.message);
        apiInfoModel.fail?.message === "text" && _AddMessageText(stateItemsToChange, apiInfoModel.fail.messageProp, response.message );
        apiInfoModel.fail?.modalForm && _AddCustomModal(stateItemsToChange, apiInfoModel.fail.modalForm);
        _RefreshData(dispatchProps, apiInfoModel);
      }

      dispatchProps.changeState(stateItemsToChange);
    })
    .catch((err) => {
      // we will never need this as its an application error and cant make the front end do anything besides a clean message
      // since there wont be a response object required for the call
      //apiInfoModel.error?.updatePaths?.length && _UpdatePathsInStateFromResponse(stateItemsToChange, response, apiInfoModel.error.updatePaths);

      apiInfoModel.error?.message === "modal" && DisplayInfoDialog(dispatchProps, "An Error Occured", err);
      //apiInfoModel.error?.message === "text" && _AddMessageText(stateItemsToChange, apiInfoModel.loading, { success: true, title: "An Error Occured", message: err.toString() });
      apiInfoModel.error?.message === "text" && _AddMessageText(stateItemsToChange, apiInfoModel.error.messageProp, err.toString());
      apiInfoModel.error?.modalForm && _AddCustomModal(stateItemsToChange, apiInfoModel.error.modalForm);
      dispatchProps.changeState(stateItemsToChange);
    });
}

function _RefreshData(dispatchProps, apiInfo) {
  if (apiInfo.refreshData) {
    var apiInfoModelGet = {
      endpoint: {
        url: apiInfo.refreshData.url,
        token: apiInfo.endpoint.token,
        data: {}
      },

      loading: apiInfo.refreshData.loading,

      success: {
        message: "off",
        updatePaths: apiInfo.refreshData.updatePaths
      },

      fail: {
        message: "modal"
      },

      error: {
        message: "modal"
      }
    };

    Get(apiInfoModelGet, dispatchProps);
  }
}

function _ConstructEndpointUrl(endpointUrl) {
  var apiEndpointBaseUrl = EndpointBaseUrls("api");
  var finalUrl = `${apiEndpointBaseUrl}/${endpointUrl}`;
  return finalUrl;
}

function _ToggleLoading(dispatchProps, apiInfoLoadingPropName, value) {
  if (apiInfoLoadingPropName) {
    dispatchProps.changeState(
      [{ path: ["loading", apiInfoLoadingPropName], value: value }]
    );
  }
}

function _ChangePage(dispatchProps, page){
  dispatchProps.changePage(page);
}

function _UpdatePathsInStateFromResponse(stateItemsToChange, response, updatePaths = []) {
  updatePaths.forEach(pathArray => {
    var lastItem = pathArray[pathArray.length - 1];
    var value = response.data[lastItem];

    if (value === undefined) {
      value = response.data;
    }

    stateItemsToChange.push(
      { path: pathArray, value: value }
    );
  });
}

function _ResetPathsInState(stateItemsToChange, setStateProps = []){
  setStateProps.forEach(propArray => {
    stateItemsToChange.push({path: propArray.path, value: propArray.value});
  });
}

function _AddCustomModal(stateItemsToChange, modalForm) {
  stateItemsToChange.push({ path: ["modal", "open"], value: true });
  stateItemsToChange.push({ path: ["modal", "content"], value: modalForm.content });
  stateItemsToChange.push({ path: ["modal", "size"], value: modalForm.size });
}

function _AddMessageText(stateItemsToChange, messageProp, messageData) {
  stateItemsToChange.push(
    {
      path: ["message", messageProp],
      value: messageData
    }
  );
}

export {
  EndpointBaseUrls,

  Get,
  Put,
  Patch,
  Post,
  Delete
};