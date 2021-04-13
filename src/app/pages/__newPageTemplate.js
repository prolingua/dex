import React from 'react';
import { connect } from 'react-redux';

import { InfoCircleIcon } from "react-line-awesome";
import { Row, Col, Button, Form } from "react-bootstrap";

import { Get, Post, Patch, Put, Delete } from 'common/server';
import Loading from "app/pages/components/Loading";

import actions from "actions";
const { creators } = actions;

const FileName = ({ stateProps, dispatchProps }) => {
  return (
    <h1>Content</h1>
  );
}

function mapStateToProps(state) {
  return {
    stateProps: {

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

export default connect(mapStateToProps, mapDispatchToProps)(FileName);
