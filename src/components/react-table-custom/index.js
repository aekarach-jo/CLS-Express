import React from 'react';
import Table from './Table';

export const TableBoxed = ({ tableInstance, className = 'react-table boxed', useEmptyRow, CmpEmptyRow, ...rest }) => (
  <Table tableInstance={tableInstance} className={className} useEmptyRow={useEmptyRow} CmpEmptyRow={CmpEmptyRow} {...rest} />
);

export const TableRows = ({ tableInstance, className = 'react-table rows', useEmptyRow, CmpEmptyRow, ...rest }) => (
  <Table tableInstance={tableInstance} className={className} useEmptyRow={useEmptyRow} CmpEmptyRow={CmpEmptyRow} {...rest} />
);
