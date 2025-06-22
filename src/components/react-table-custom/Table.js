import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
// import { Row, Col, Pagination } from 'react-bootstrap';
// import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Spinner } from 'react-bootstrap';
import './style.css';

const defaultEmptyRow = (props) => {
  return (
    <td {...props}>
      <div className="w-100">No data found</div>
    </td>
  );
};

const Table = ({ tableInstance, className = 'react-table', useEmptyRow, CmpEmptyRow = defaultEmptyRow, customStyle, rowStyle }) => {
  const {
    //
    getTableProps,
    headerGroups,
    page,
    getTableBodyProps,
    prepareRow,
    toggleAllPageRowsSelected,
    setIsOpenAddEditModal,
    disabled,
    flatHeaders,
  } = tableInstance;
  // console.log('tableInstance :', tableInstance);
  const [dataFetched, setDataFetched] = useState(false);
  const [isFetch, setIsFetch] = useState(false);
  const [haveData, sethaveData] = useState(false);

  useEffect(() => {
    // Set dataFetched to true when data is fetched
    if (page.length > 0) {
      setDataFetched(true);
    }
    if (isFetch) {
      if (page.length === 0) {
        sethaveData(true);
      } else {
        sethaveData(false);
      }
    }
    setIsFetch(true);
  }, [page]);
  return (
    <>
      <table className={(className, 'scroll-section')} {...getTableProps()} style={customStyle} id="hoverableRows">
        <thead className="table-header">
          {headerGroups.map((headerGroup, headerIndex) => (
            <tr key={`header${headerIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th
                    key={`th.${index}`}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={classNames(column.headerClassName, {
                      sorting_desc: column.isSortedDesc,
                      sorting_asc: column.isSorted && !column.isSortedDesc,
                      sorting: column.sortable,
                    })}
                  >
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="table-scroll" {...getTableBodyProps()}>
          {/* {useEmptyRow && (
            <tr>
              <Spinner animation="border" variant="primary">
                <span className="visually-hidden"> Loading...</span>
              </Spinner>
            </tr>
          )} */}
          {!dataFetched && !haveData && (
            <tr className="text-center">
              <td colSpan={headerGroups[0].headers.length}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden"> Loading...</span>
                </Spinner>
              </td>
            </tr>
          )}
          {haveData && (
            <tr className="text-center">
              <CmpEmptyRow />
            </tr>
          )}
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                key={`tr.${i}`}
                {...row.getRowProps()}
                className={classNames({ selected: row.isSelected })}
                style={{
                  // ทำสี backdrond ของ card ให้สลับกัน
                  ...(i % 2 === 0 ? { background: '#f9f9f9' } : {}),
                }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`td.${cellIndex}`}
                    style={rowStyle}
                    {...cell.getCellProps()}
                    className={classNames(cell.column.colClassName)}
                    onClick={() => {
                      if (disabled) {
                        return;
                      }

                      let isSelectable = true;
                      if (typeof tableInstance.isSelectable === 'function') {
                        isSelectable = tableInstance.isSelectable({ row });
                      } else if (typeof tableInstance.isSelectable === 'boolean') {
                        isSelectable = tableInstance.isSelectable;
                      }

                      if (typeof tableInstance.isSelectable === 'undefined') {
                        isSelectable = true;
                      }

                      if (isSelectable) {
                        if (cell.column.id === 'name') {
                          toggleAllPageRowsSelected?.(false);
                          row.toggleRowSelected?.();
                          setIsOpenAddEditModal?.(true);
                        } else {
                          row.toggleRowSelected?.();
                        }
                      }
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
export default Table;
