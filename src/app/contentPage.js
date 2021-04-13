// @flow
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import IEDapp from "app/pages/IEDapp";

import {GetUrlSegmentItem} from "common/helpers";

import actions from "actions";
const { creators } = actions;

const ContentPage = ({ stateProps, dispatchProps }) => {

  return (
    <React.Fragment>
      <IEDapp />
    </React.Fragment>
  );
};


function mapStateToProps(state) {
    return {
    stateProps: {
      page: state.general.page,
      isLoggedIn: state.general.auth.isLoggedIn
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {
      changePage: (name) => {
        dispatch(creators.changePage(name));
      },

      changeState: (items) => {
        dispatch(creators.changeState({ items }));
      }
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContentPage));
