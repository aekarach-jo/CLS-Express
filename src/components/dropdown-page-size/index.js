import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';

const DropdownPageSize = (props) => {
  const { formatMessage: f } = useIntl();

  const [pageSizes, setPageSizes] = useState([5, 10, 20, 50]);
  const { pageSizes: _pageSizes, setPageSize, currentPageSize } = props;

  useEffect(() => {
    if (_pageSizes) {
      setPageSizes(_pageSizes);
    }
  }, [_pageSizes]);

  return (
    <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
      <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'common.display-count' })}</Tooltip>}>
        <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
          {f({ id: 'common.count-items' }, { count: currentPageSize })}
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu className="shadow dropdown-menu-end">
        {pageSizes.map((pageSize) => (
          <Dropdown.Item key={pageSize} active={currentPageSize === pageSize} onClick={() => setPageSize(pageSize)}>
            {f({ id: 'common.count-items' }, { count: pageSize })}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownPageSize;
