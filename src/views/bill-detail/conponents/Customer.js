import React from 'react';
import classNames from 'classnames';
import { Modal } from 'react-bootstrap';
import CustomerDetail from './customer-detail/CustomerDetail';

const Customer = ({ show, onHide, onGetCustomerData }) => {
  return (
    <div
      className={classNames('supplier-address-detail-card form-check custom-card w-100 position-relative p-0 m-0 h-100 ', {
        'through-content': show,
      })}
    >
      <Modal className="modal-right large fade" show={show} onHide={onHide} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CustomerDetail onHide={onHide} onGetCustomerData={onGetCustomerData} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Customer;
