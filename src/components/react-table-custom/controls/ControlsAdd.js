import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ControlsAdd = ({ tableInstance, disabled }) => {
  const { toggleAllPageRowsSelected, setIsOpenAddEditModal } = tableInstance;
  const addButtonClick = () => {
    toggleAllPageRowsSelected(false);
    setIsOpenAddEditModal(true);
  };

  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top-add">Add</Tooltip>}>
      <Button onClick={addButtonClick} variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto" disabled={disabled}>
        <CsLineIcons icon="plus" /> <span>Add</span>
      </Button>
    </OverlayTrigger>
    // <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top-add">Add</Tooltip>}>
    //   <Button onClick={addButtonClick} variant="foreground-alternate" className="btn-icon btn-icon-only shadow add-datatable" disabled={disabled}>
    //     <CsLineIcons icon="plus" />
    //   </Button>
    // </OverlayTrigger>
  );
};
export default ControlsAdd;
