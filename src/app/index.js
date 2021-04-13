// @flow

import React from "react";
import { connect } from "react-redux";
/* import { Dimmer } from "semantic-ui-react";
import {
  ShoppingBasketIcon,
  UserIcon,
  UserCheckIcon,
  UserCogIcon,
  StoreAltIcon,
  CogIcon,
  SignOutIcon,
  RedoAltIcon,
  SignInIcon,
  SyncIcon,
  BarsIcon,
  TimesIcon
} from "react-line-awesome"; */
import DynamicModal from "app/pages/components/DynamicModal";
import { Dropdown } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import ContentPage from "app/contentPage";
import actions from "actions";


/* import { Get } from "common/server";
import { GetUrlSegmentItem, GetUrlParam, PauseWithDimmer, GetClaimsFromToken, LogOut } from "common/helpers";
 */
import "lato-font/css/lato-font.css"
import "styles/site.css";
import "styles/drawer.css";

// npm run build creates a file with version inside, read it from there?
var version = "3.0.0";
var firstLoad = true;

const App = ({ stateProps, dispatchProps }) => {
  
  return (
    <React.Fragment>
      <DynamicModal stateProps={stateProps} dispatchProps={dispatchProps} />      
      {stateProps.startingBlockchainData ? 
      <div style={{position:'relative', height: window.innerHeight}}>
        <div style={{position: 'absolute', top: '50%', left: '50%'}}>
          <Spinner size="sm" animation="border" /> 
          <div className="mt-2">Loading</div>
        </div>
      </div>       
      :
      <ContentPage /> 
      }
    </React.Fragment >
  );
}

const { creators } = actions;

function mapStateToProps(state) {
  return {
    stateProps: {
      startingBlockchainData: state.general.blockchain.startingBlockchainData,
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {     
      changeState: (items) => {
        dispatch(creators.changeState({ items }));
      },
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
