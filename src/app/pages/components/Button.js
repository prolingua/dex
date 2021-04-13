import React from "react";
import { connect } from "react-redux";

import { CheckIcon } from "react-line-awesome"

import { Button as BButton } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";

import actions from "actions";
const { creators } = actions;

const Button = ({ size, icon, variant, spinnerSize, text, disabled, className, loading, onClick }) => {
  var spinnerSize = size ? size : "sm";
  var icon = icon ? icon : <CheckIcon />;
  var variant = variant ? variant : "secondary";
  var size = size ? size : "md";
  var text = text ? text : "Submit";
  var disabled = disabled ? disabled : false;
  var className = className ? className : "";

  if (loading) {
    return (
      <BButton className={className} disabled size={size} variant={variant}>
        {text} | <Spinner animation="border" size={spinnerSize} />
      </BButton>
    );
  }

  return (
    <BButton 
      onClick={onClick}
      className={className} disabled={disabled} size={size} variant={variant}>
      {text} | {icon}
    </BButton>
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
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Button);