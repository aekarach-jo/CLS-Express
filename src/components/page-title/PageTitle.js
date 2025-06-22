import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom';
import ButtonsCheckAll from '../table-ng/components/ButtonsCheckAll';

const Title = ({
  title,
  description,
  isLoading,
  addButton,
  topupBtn,
  buttons = {},
  tableInstance = {},
  setIsConfirmModal = {},
  showCheckAll,
  bgColor = '',
  customStyle,
  fontStyle,
  isHideBtnAdd = false,
  isHideTopupBtn = false,
}) => {
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
          <h1 className="mb-2 pb-0" style={{ fontWeight: '700', fontSize: '24px' }}>
            {title}
          </h1>
          <div className="text-muted font-heading description" style={customStyle}>
            {description}
          </div>
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
                variant="outline-primary"
                onClick={() => buttons?.cancel?.onCancel()}
                disabled={isLoading}
              >
                <span>{buttons?.cancel?.label || 'Cancel'}</span>
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
          {buttons?.save && !buttons?.save?.isHide && (
            <>
              <Button
                variant="info"
                type="submit"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1"
                style={{ backgroundColor: bgColor !== '' ? bgColor : '' }}
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
                disabled={buttons?.submit?.disabled}
                onClick={() => buttons?.submit?.onSubmit()}
              >
                <CsLineIcons icon="send" /> <span>{buttons?.submit?.label || 'Submit'}</span>
              </Button>
            </>
          )}{' '}
          {buttons?.revert && !buttons?.revert?.isHide && (
            <>
              <Button
                variant="success"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1"
                disabled={isLoading}
                onClick={() => buttons?.revert?.onSubmit()}
              >
                <CsLineIcons icon="revert" /> <span>{buttons?.revert?.label || 'Reverse'}</span>
              </Button>
            </>
          )}{' '}
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
          {buttons?.export && !buttons?.export?.isHide && (
            <>
              <Button
                variant="outline-primary"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1 rounded-sm"
                disabled={isLoading}
                onClick={() => buttons?.export?.onSubmit()}
              >
                <span>{buttons?.export?.label || 'Export'}</span>
              </Button>
            </>
          )}
          {buttons?.import && !buttons?.import?.isHide && (
            <>
              <Button
                variant="primary"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1 rounded-sm"
                disabled={isLoading}
                onClick={() => buttons?.import?.onSubmit()}
              >
                <span>{buttons?.import?.label || 'Import'}</span>
              </Button>
            </>
          )}
          {buttons?.receiving && !buttons?.receiving?.isHide && (
            <>
              <Button
                variant="warning"
                className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1"
                disabled={isLoading}
                onClick={() => buttons?.receiving?.onSubmit()}
              >
                <CsLineIcons icon="plus" /> <span>{buttons?.receiving?.label || 'Receive'}</span>
              </Button>
            </>
          )}
          {addButton && !isHideBtnAdd && (
            <Button variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1 rounded-sm" onClick={addButtonClick} disabled={isLoading}>
              <CsLineIcons icon="plus" /> <span>{addButton?.label || 'Add New'}</span>
            </Button>
          )}
          {topupBtn && !isHideTopupBtn && (
            <Button
              variant="primary"
              className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1 rounded-sm"
              onClick={() => setIsConfirmModal(true)}
              disabled={isLoading}
            >
              <CsLineIcons icon="plus" /> <span>{topupBtn?.label}</span>
            </Button>
          )}
          {showCheckAll && <ButtonsCheckAll tableInstance={tableInstance} />}
        </Col>
      </Row>
    </div>
  );
};

export default Title;
