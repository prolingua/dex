import makeAction from "actions/makeActionCreator";

const resetState = "resetState";
const logout = "logout";
const changePage = "changePage";
const changeState = "changeState";
const updateInitialState = "updateInitialState";
const reRender = "reRender";

export default {
  constants: {
    resetState,
    logout,
    changePage,
    changeState,
    updateInitialState,
    reRender
  },

  creators: {
    resetState: makeAction(resetState, "data"),
    logout: makeAction(logout, "data"),
    changePage: makeAction(changePage, "data"),
    changeState: makeAction(changeState, "data"),
    updateInitialState: makeAction(updateInitialState, "data"),
    reRender: makeAction(reRender, "data"),
  }
};
