import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import clx from 'classnames';

const ConfirmDeleteModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
  const { formatMessage: f } = useIntl();

  return (
    <Modal
      className={clx('small fade ', className)}
      show={show}
      onHide={onCancel}
      centered
      contentClassName={clx({ 'overlay-spinner': loading })}
      backdrop={loading ? 'static' : true}
      {...rest}
    >
      <Modal.Body className="d-flex flex-column gap-4">
        <Modal.Title className="font-weight-bold">{titleText || 'Delete'}</Modal.Title>
        <div style={{ fontFamily: 'Inter' }}>{confirmText}</div>
        <div className="d-flex flex-row gap-2 justify-content-end">
          <Button variant="outline-danger" onClick={onCancel} disabled={loading}>
            {cancelText || f({ id: 'common.cancel' })}
          </Button>
          <Button variant="danger" className="text-white" onClick={onConfirm} disabled={loading}>
            {okText || f({ id: 'common.ok' })}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDeleteModal;
