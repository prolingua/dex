import React from "react";
import { connect } from "react-redux";

import { BarsIcon, HomeIcon, DotCircleIcon } from "react-line-awesome";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/ListGroup';

import { DisplayInfoDialog, GetUrlParam, GetClaimsFromToken } from "common/helpers";
import { EndpointBaseUrls } from "common/server";
import actions from "actions";

const { creators } = actions;

var firstLoad = true;
var interval = null;
var intervalSet = false;
var lastActivityTime = null;

const LoggedInTemplate = ({ stateProps, dispatchProps, markup }) => {

  if (firstLoad) {
    firstLoad = false;
  }

  lastActivityTime = new Date();

  if (!intervalSet) {
    Date.prototype.addHours = function (h) {
      this.setTime(this.getTime() + h * 60 * 60 * 1000);
      return this;
    };
    intervalSet = true;
    interval = setInterval(function () {
      var fifteenMinutesAgo = new Date().addHours(-0.25);
      //var fifteenMinutesAgo = new Date().addHours(-0.025);
      if (fifteenMinutesAgo.getTime() > lastActivityTime.getTime()) {
        clearInterval(interval);
        dispatchProps.logout();
      }
    }, 60000);
  }

  var website = EndpointBaseUrls("web");

  var menuState = stateProps.menuOpened ? "" : "toggled";

  return (
    <div className={`d-flex ` + menuState} id="wrapper">
      <div className="bg-dark text-light border-right" id="sidebar-wrapper">
        <div className="sidebar-heading">TecTrack</div>

        <ListGroup>
          <ListGroup.Item className="bg-dark text-light" action>
            <HomeIcon /> Home
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light" action>
            <DotCircleIcon /> Page 2
        </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light" action>
            <DotCircleIcon /> Page 3
        </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light" action>
            <DotCircleIcon /> Page 4
        </ListGroup.Item>

        </ListGroup>

      </div>

      <div id="page-content-wrapper">

        <Nav className="navbar navbar-expand-lg bg-dark text-light mb-3">
          <BarsIcon
            onClick={() => {
              dispatchProps.changeState([
                { path: ["menu", "open"], value: !stateProps.menuOpened }
              ])
            }}
            className="pointer" style={{ fontSize: "30px" }} />

          <Dropdown className="ml-auto">
            <Dropdown.Toggle as="a" variant="success" id="dropdown-basic">
              Account
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as="span">Account Type: {stateProps.userType}</Dropdown.Item>
              <Dropdown.Item>Manage Account</Dropdown.Item>
              <Dropdown.Item onClick={(e) => dispatchProps.logout()}>Log Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>

        <div className="container-fluid">
          {markup}
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      version: state.general.version,
      menuOpened: state.general.menu.open,
      userType: state.general.auth.userType
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {
      changeState: (items) => {
        dispatch(creators.changeState({ items }));
      },

      changePage: (name) => {
        dispatch(creators.changePage(name));
      },

      resetState: () => {
        window.location.reload();
        dispatch(creators.resetState());
      },

      logout: () => {
        dispatch(creators.logout());
        dispatch(creators.changePage("login"));
        window.location.reload(true);
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedInTemplate);
