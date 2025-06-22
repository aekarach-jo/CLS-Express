import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom';
import ButtonsCheckAll from '../table-ng/components/ButtonsCheckAll';

const PageTitleWithColor = ({ title, description, isLoading, addButton, buttons = {}, tableInstance = {}, showCheckAll }) => {
  const history = useHistory();
  const { toggleAllPageRowsSelected, setIsOpenAddEditModal } = tableInstance;

  const addButtonClick = () => {
    if (addButton?.link) {
      history.push(addButton?.link);
    } else {
      toggleAllPageRowsSelected?.(false);
      setIsOpenAddEditModal?.(true);
    }
  };

  return (
    <div className="page-title-container mb-3">
      <Row>
        {buttons?.back && (
          <Col xs="auto" className="mb-2 align-self-md-center">
            <Button variant="link" className="btn-icon-only" style={{ padding: 0 }} onClick={() => history.goBack()}>
              <CsLineIcons icon="arrow-left" />
            </Button>
          </Col>
        )}
        <Col className="mb-2">
          <h1 className="mb-2 pb-0 display-4">{title}</h1>
          <div className="text-muted font-heading text-medium">{description}</div>
        </Col>
        <Col xs="12" sm="12" md="auto" className="d-md-block">
          {/* {buttons?.back && (
            <>
              <Button variant="outline-dark" className="btn-icon btn-icon-start w-100 w-md-auto mb-1" onClick={() => history.goBack()}>
                <CsLineIcons icon="arrow-left" /> <span>{buttons?.back?.label || 'Back'}</span>
              </Button>{' '}
            </>
          )}{' '} */}
          {buttons?.cancel && !buttons?.cancel?.isHide && (
            <>
              <Button
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1"
                variant="outline-alternate"
                onClick={() => buttons?.cancel?.onCancel()}
                disabled={isLoading}
              >
                <CsLineIcons icon="close" /> <span>{buttons?.cancel?.label || 'Cancel'}</span>
              </Button>{' '}
            </>
          )}
          {buttons?.edit && !buttons?.edit?.isHide && (
            <>
              <Button className="btn-icon btn-icon-start w-100 w-md-auto mb-1" variant="primary" onClick={() => buttons?.edit?.onEdit()} disabled={isLoading}>
                <CsLineIcons icon="edit" /> <span>{buttons?.edit?.label || 'Edit'}</span>
              </Button>{' '}
            </>
          )}
          {buttons?.delete && !buttons?.delete?.isHide && (
            <>
              <Button
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1"
                variant="danger"
                onClick={() => buttons?.delete?.onDelete()}
                disabled={isLoading}
              >
                <CsLineIcons icon="bin" /> <span>{buttons?.delete?.label || 'Delete'}</span>
              </Button>{' '}
            </>
          )}
          {buttons?.save && !buttons?.save?.isHide && (
            <>
              <Button
                variant="info"
                type="submit"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1"
                style={{backgroundColor: '#1EA8E7'}}
                onClick={buttons?.save?.onSubmit}
                disabled={isLoading}
              >
                <CsLineIcons icon="save" /> <span>{buttons?.save?.label || 'Save'}</span>
              </Button>{' '}
            </>
          )}
          {buttons?.submit && !buttons?.submit?.isHide && (
            <>
              <Button
                variant="primary"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1"
                style={{backgroundColor: '#1EA8E7'}}
                disabled={isLoading}
                onClick={() => buttons?.submit?.onSubmit()}
              >
                <CsLineIcons icon="send" /> <span>{buttons?.submit?.label || 'Submit'}</span>
              </Button>
            </>
          )}
          {buttons?.export && !buttons?.export?.isHide && (
            <>
              <Button
                variant="primary"
                style={{backgroundColor: '#1EA8E7'}}
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1"
                disabled={isLoading}
                onClick={() => buttons?.export?.onSubmit()}
              >
                <CsLineIcons icon="send" /> <span>{buttons?.export?.label || 'Export'}</span>
              </Button>
            </>
          )}
          {addButton && (
            <Button variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto mb-1" onClick={addButtonClick} disabled={isLoading}>
              <CsLineIcons icon="plus" /> <span>{addButton?.label || 'Add New'}</span>
            </Button>
          )}
          {showCheckAll && <ButtonsCheckAll tableInstance={tableInstance} />}
        </Col>
      </Row>
    </div>
  );
};

export default PageTitleWithColor;