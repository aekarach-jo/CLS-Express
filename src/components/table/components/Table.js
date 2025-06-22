import classNames from 'classnames';
import React, { useCallback } from 'react';
import { Form, Table as TableR } from 'react-bootstrap';

const Table = ({ tableInstance, className = 'react-table boxed', rowProps, isCheckAll, rowStyle }) => {
  const { data, setData, getTableProps, headerGroups, page, getTableBodyProps, prepareRow, toggleAllPageRowsSelected, setIsOpenAddEditModal } = tableInstance;
  const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);
  const handleCheckAll = (event) => {
    if (event.target.checked) {
      const addCheckallToDataList = data?.map((item) => {
        return {
          ...item,
          checked: true,
        };
      });
      setData(addCheckallToDataList);
    } else {
      const addCheckallToDataList = data?.map((item) => {
        return {
          ...item,
          checked: false,
        };
      });
      setData(addCheckallToDataList);
    }
  };

  return (
    <>
      <TableR responsive className={className} {...getTableProps()} style={{ background: 'white', borderRadius: '5px' }}>
        <thead>
          {headerGroups.map((headerGroup, headerIndex) => (
            <tr key={`header${headerIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th
                    key={`th.${index}`}
                    {...column.getHeaderProps(isCheckAll && index === 0 ? {} : column.getSortByToggleProps())}
                    className={`${classNames(column.headerClassName, {
                      sorting_desc: column.isSortedDesc,
                      sorting_asc: column.isSorted && !column.isSortedDesc,
                      sorting: column.sortable,
                    })} position-relative`}
                  >
                    {isCheckAll && index === 0 && (
                      <Form.Check className="position-absolute" style={{ left: 0 }} type="checkbox" label="" onClick={handleCheckAll} />
                    )}
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            const newRowProps = row.getRowProps(rowProps);
            return (
              <tr
                key={`tr.${i}`}
                {...row.getRowProps()}
                {...newRowProps}
                onClick={handleRowClick(newRowProps.onClick, row?.original, row?.original?.id)}
                className={classNames({ selected: row.isSelected })}
                style={{ verticalAlign: 'middle', boxShadow: 'none', position: 'relative' }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`td.${cellIndex}`}
                    {...cell.getCellProps()}
                    onClick={() => {
                      if (!row.toggleRowSelected) return;

                      if (cell.column.id === 'name') {
                        toggleAllPageRowsSelected(false);
                        row.toggleRowSelected();
                        setIsOpenAddEditModal(true);
                      } else {
                        row.toggleRowSelected();
                      }
                    }}
                    style={rowStyle}
                    className="sh-md-4"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </TableR>
    </>
  );
};
export default Table;
