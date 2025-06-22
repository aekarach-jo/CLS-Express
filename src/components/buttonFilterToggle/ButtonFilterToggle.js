import React from 'react';
import { ToggleButton } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ButtonFilterToggle = ({ onClick, open }) => {
  return (
    <ToggleButton id="filterToggle" type="checkbox" variant="foreground" className="btn-icon btn-icon-only shadow" checked={open} onClick={onClick}>
      <CsLineIcons icon="filter" />
    </ToggleButton>
  );
};

export default ButtonFilterToggle;
