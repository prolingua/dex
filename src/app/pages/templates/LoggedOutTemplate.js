import React from "react";
import { connect } from "react-redux";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

import { DisplayInfoDialog, GetUrlParam, GetClaimsFromToken } from "common/helpers";
import { EndpointBaseUrls } from "common/server";
import actions from "actions";

const { creators } = actions;

var firstLoad = true;

const LoggedOutTemplate = ({ stateProps, dispatchProps, markup }) => {

  if (firstLoad) {
    firstLoad = false;
  }

  var website = EndpointBaseUrls("web")

  return (
    <Container className="min-vh-100 bg-dark vertically-aligned" fluid>
      <Row>
        <Col className="mx-auto" md={6} lg={4}>
          <Card className="rounded-0" >
            <Card.Body>
              <Image style={{ width: "200px" }} src="/images/logo.png" />
              <small className="float-right text-muted">Version {stateProps.version}</small>
              <hr />
              {markup}
              <hr />
              <a
                onClick={(e) => {
                  e.preventDefault();
                  dispatchProps.changePage("/login");
                }}
                className="text-info mr-2" href="#">Log In</a>|
                <a
                onClick={(e) => {
                  e.preventDefault();
                  dispatchProps.changePage("/register");
                }}
                className="text-info ml-2" href="#">Register</a>

                <a
                  onClick={(e) => {

                  }}
                className="text-info float-right" href={website}>Go to Website</a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {
      version: state.general.version
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
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedOutTemplate);
