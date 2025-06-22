import React from 'react';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useIntl } from 'react-intl';

const ControlsPageSize = ({ tableInstance, isLoading }) => {
  const { formatMessage: f } = useIntl();

  const {
    setPageSize,
    gotoPage,
    state: { pageSize },
  } = tableInstance;
  const options = [5, 10, 20];

  const onSelectPageSize = (size) => {
    setPageSize(size);
    gotoPage(0);
  };
  return (
    <OverlayTrigger placement="top" delay={{ show: 1000, hide: 0 }} overlay={<Tooltip>{f({ id: 'common.items' })}</Tooltip>}>
      {({ ref, ...triggerHandler }) => (
        <Dropdown className="d-inline-block" align="end">
          <Dropdown.Toggle ref={ref} {...triggerHandler} variant="foreground-alternate" className="shadow" disabled={isLoading}>
            {f({ id: 'common.count-items' }, { count: pageSize })}
          </Dropdown.Toggle>
          <Dropdown.Menu
            className="shadow dropdown-menu-end"
            popperConfig={{
              modifiers: [
                {
                  name: 'computeStyles',
                  options: {
                    gpuAcceleration: false,
                  },
                },
              ],
            }}
          >
            {options.map((pSize) => (
              <Dropdown.Item key={`pageSize.${pSize}`} active={pSize === pageSize} onClick={() => onSelectPageSize(pSize)}>
                {f({ id: 'common.count-items' }, { count: pSize })}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </OverlayTrigger>
  );
};

export default ControlsPageSize;
