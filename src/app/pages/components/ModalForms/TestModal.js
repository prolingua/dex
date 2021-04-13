import React from "react";
import { connect } from "react-redux";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { CheckIcon } from "react-line-awesome";

import { Post } from "common/server";

import actions from "actions";
const { creators } = actions;

const TestModal = ({ stateProps, dispatchProps }) => {
  return (
    <React.Fragment>
      <Modal.Header>
        <h3>
          {stateProps.formMode ? stateProps.formMode : "Test Modal"}
        </h3>
      </Modal.Header>

      <Modal.Body>
        {
          stateProps.formMode === "CREATE" &&
          <React.Fragment>
            <Form.Group>
              <Form.Label>Book Name</Form.Label>
              <Form.Control
                value={stateProps.testDataSelected.book}
                onChange={(e) => {
                  dispatchProps.changeState([
                    {path:["testDataSelected", "book"], value:e.target.value}
                  ]);
                }}
                type="text"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Order</Form.Label>
              <Form.Control
                value={stateProps.testDataSelected.order}
                onChange={(e) => {
                  var num = Number(e.target.value);
                  dispatchProps.changeState([
                    {path:["testDataSelected", "order"], value:num}
                  ]);
                }}
                type="number"
              />
            </Form.Group>

            <Form.Group>
              <Form.Check 
                checked={stateProps.testDataSelected.visible}
                onChange={(e) => {
                  dispatchProps.changeState([
                    {path:["testDataSelected", "visible"], value:e.target.checked}
                  ]);
                }}  
                type="checkbox" label="Visible" />
            </Form.Group>
          </React.Fragment>
        }
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={() => {
            dispatchProps.changeState([
              { path: ["modal", "open"], value: false },
              { path: ["modal", "formMode"], value: "" },
            ]);
          }}
          variant="secondary"
          size="sm"
          className="mr-2"
        >Cancel</Button>
        <Button
          disabled={
            (stateProps.formMode === "CREATE" && (stateProps.testDataSelected.book === "" || stateProps.testDataSelected.order === "")) ||
            stateProps.formMode === ""      
          }
          onClick={() => {
            var apiInfoModel = {
              endpoint: {
                url: `api/test/post`,
                token: "",
                data: stateProps.testDataSelected
              },
            
              loading: "PostWithModalSuccessThenGet",
            
              success: {
                message: "modal"               
              },
            
              fail: {
                message: "modal"
              },
            
              error: {
                message: "modal"        
              },
            
              refreshData: {
                url: `api/test/get/success`,
                loading: "PostWithModalSuccessThenGet_Reload",
                updatePaths: [
                  ["testData"]
                ]
              }
            };

            Post(apiInfoModel, dispatchProps);
          }}
          variant="success"
        ><span className="mr-3 pr-3 border-right">Ok</span>
        {stateProps.loadingByCreate && <Spinner size="sm" animation="border" />}
        {!stateProps.loadingByCreate && <CheckIcon />}</Button>
      </Modal.Footer>
    </React.Fragment>
  );
}

function mapStatetoProps(state) {
  return {
    stateProps: {
      header: state.general.modal.header,
      body: state.general.modal.body,
      formMode: state.general.modal.formMode,
      testDataSelected: state.general.testDataSelected,
      loading: state.general.loading,
      loadingByCreate: state.general.loading["PostWithModalSuccessThenGet"]
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

export default connect(mapStatetoProps, mapDispatchToProps)(TestModal);
