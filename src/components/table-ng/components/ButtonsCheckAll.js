/* eslint-disable no-nested-ternary */
import { Button, ButtonGroup, Dropdown, Form } from 'react-bootstrap';
import React, { useEffect, useRef } from 'react';

import './styles.scss';

const ButtonsCheckAll = ({ tableInstance }) => {
  const checkAllRef = useRef(null);
  const {
    getToggleAllPageRowsSelectedProps,
    setData,
    data,
    selectedFlatRows,
    state: { selectedRowIds },
  } = tableInstance;
  const { onChange, checked, indeterminate } = getToggleAllPageRowsSelectedProps();

  useEffect(() => {
    if (checkAllRef.current) {
      checkAllRef.current.indeterminate = indeterminate;
    }
    return () => {};
  }, [indeterminate]);

  const deleteSelectedItems = () => {
    setData(data.filter((x, index) => selectedRowIds[index] !== true));
  };

  const changeTagSelectedItems = (tag) => {
    const newData = data.map((x, index) => {
      if (selectedRowIds[index] === true) {
        return { ...x, tag };
      }
      return x;
    });
    setData(newData);
  };
  return (
    <div className="">
      <Button variant="outline-dark" size="sm" className="btn-icon btn-icon-start btn-outline-muted" onClick={onChange}>
        <Form.Check ref={checkAllRef} className="form-check float-start" type="checkbox" checked={checked} onChange={() => {}} /> <span>ทั้งหมด</span>
      </Button>
    </div>
  );
};
export default ButtonsCheckAll;
