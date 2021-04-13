import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import { CheckIcon } from "react-line-awesome";

import actions from "actions";
const { creators } = actions;

const InfoDialog = ({ stateProps, dispatchProps }) => {
  return (
    <React.Fragment>
      <Modal.Header>
        <h3>
          {stateProps.header}
        </h3>
      </Modal.Header>

      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: stateProps.body }}></div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={() => {
            dispatchProps.changeState([{ path: ["modal", "open"], value: false }]);
          }}
          variant="success"
        >Ok<CheckIcon className="ml-3 pl-3 border-left" /></Button>
      </Modal.Footer>
    </React.Fragment>
  );
}

function mapStatetoProps(state) {
  return {
    stateProps: {
      header: state.general.modal.header,
      body: state.general.modal.body
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchProps: {
      changeState: (items) => {
        dispatch(creators.changeState({ items }))
      }
    }
  };
}

export default connect(mapStatetoProps, mapDispatchToProps)(InfoDialog);
