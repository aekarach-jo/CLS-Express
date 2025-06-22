import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ControlsDelete = ({ tableInstance }) => {
  const {
    // selectedFlatRows,
    data,
    setData,
    state: { selectedRowIds },
  } = tableInstance;
  const onClick = () => {
    setData(data.filter((x, index) => selectedRowIds[index] !== true));
  };

  // if (selectedFlatRows.length === 0) {
  //   return (
  //     <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow delete-datatable" disabled>
  //       <CsLineIcons icon="bin" />
  //     </Button>
  //   );
  // }
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top-delete">ลบ</Tooltip>}>
      <Button onClick={onClick} size="sm" variant="outline-danger" className="btn-icon btn-icon-only delete-datatable">
        <CsLineIcons icon="bin" />
      </Button>
    </OverlayTrigger>
  );
};
export default ControlsDelete;
