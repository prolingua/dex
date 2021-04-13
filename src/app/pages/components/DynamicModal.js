
import React from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import InfoDialog from "app/pages/components/ModalMessages/InfoDialog";
import TestModal from "app/pages/components/ModalForms/TestModal";

import actions from "actions";
const { creators } = actions;

const DynamicModal = ({ stateProps, dispatchProps }) => {

  var content = {
    InfoDialog: <InfoDialog />,
    TestModal: <TestModal />,
  };

  var selectedContent = content[stateProps.content];

  selectedContent = selectedContent === undefined ?
    <Button
      onClick={(e) => {
        e.preventDefault();
        dispatchProps.changeState([{ path: ["modal", "open"], value: false }]);
      }}
    >
      Modal Content {stateProps.content} Not Found
    </Button>
    :
    selectedContent;

  return (
    <Modal
      show={stateProps.open}
      size={stateProps.size}
      //closeOnEscape={false}
      //closeOnDimmerClick={false}

      //dimmer={true}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      //autoFocus={false}
      enforceFocus={false}
    >
      {selectedContent}

    </Modal>

  );
}

function mapStatetoProps(state) {
  return {
    stateProps: {
      content: state.general.modal.content,
      open: state.general.modal.open,
      size: state.general.modal.size
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

export default connect(mapStatetoProps, mapDispatchToProps)(DynamicModal);