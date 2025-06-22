import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';

const ControlsDelete = ({ tableInstance, needConfirmation, confirmText, disabled }) => {
  const {
    selectedFlatRows = [],
    data,
    setData,
    state: { selectedRowIds = {} },
  } = tableInstance;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);

  const deleteItems = () => {
    setData(data.filter((x, index) => selectedRowIds[index] !== true));
    setIsOpenDeleteModal(false);
  };

  const onClick = () => {
    if (needConfirmation) {
      setIsOpenDeleteModal(true);
    } else {
      deleteItems();
    }
  };

  const handleOnCancel = () => {
    setIsOpenDeleteModal(false);
  };

  if (selectedFlatRows.length === 0) {
    return (
      <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow delete-datatable" disabled>
        <CsLineIcons icon="bin" />
      </Button>
    );
  }
  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top-delete">Delete</Tooltip>}>
        <Button onClick={onClick} variant="foreground-alternate" className="btn-icon btn-icon-only shadow delete-datatable" disabled={disabled}>
          <CsLineIcons icon="bin" />
        </Button>
      </OverlayTrigger>
      {needConfirmation && (
        <ConfirmModal
          show={isOpenDeleteModal}
          confirmText={confirmText || `Delete selected ${selectedFlatRows.length} item(s) ?`}
          onConfirm={deleteItems}
          onCancel={handleOnCancel}
        />
      )}
    </>
  );
};
export default ControlsDelete;
