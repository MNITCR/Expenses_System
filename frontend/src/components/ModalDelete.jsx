import { Button, Modal } from "flowbite-react";
import React from "react";

const ModalDelete = ({showDeleteConfirm, handleCancelDelete, handleDelete}) => {
  return (
    <>
      <Modal
        show={showDeleteConfirm}
        size="md"
        onClose={handleCancelDelete}
        aria-labelledby="modal-title"
      >
        <Modal.Header id="modal-title">Are you sure?</Modal.Header>
        <Modal.Body>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCancelDelete} color="gray">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="red">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalDelete;
