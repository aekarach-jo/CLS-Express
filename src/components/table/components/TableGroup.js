import React, { useCallback, useMemo, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import useConvertUOM from 'hooks/useConvertUOM';
import { useIntl } from 'react-intl';
import useFormat from 'hooks/useFormat';
import './style.css';

const TableGroup = React.forwardRef(({ tableInstance, loading, rowProps = () => ({}) }, ref) => {
  const { formatMessage: f } = useIntl();
  const { formatNumber: n } = useFormat();
  const { useConvertReamToSheet, useConvertSheetToReam } = useConvertUOM();

  const { columns: allColumns, useSorting, page = [], prepareRow } = tableInstance;

  const columns = useMemo(() => allColumns.filter((c) => c.isVisible), [allColumns]);

  const { sort, sortColumn, sortDirection } = useSort();

  const translate = useMemo(
    () => ({
      priority: f({ id: 'cutting.group.priority' }),
      priority1: f({ id: 'cutting.group.priority.1.desc' }),
      priority2: f({ id: 'cutting.group.priority.2.desc' }),
    }),
    [f]
  );

  const handleOnSort = useCallback(
    (columnId) => (e) => {
      if (!useSorting) {
        return;
      }
      sort(columnId);
    },
    [sort, useSorting]
  );

  const handleRowClick = useCallback((oc, itemD, group, material) => (e) => oc?.(e, itemD, group, material), []);

  return (
    <div
      className={clx('react-table page-print', {
        'overlay-spinner': loading,
      })}
      ref={ref}
    >
      <Row
        className={clx('g-0 h-100 align-content-center d-none d-md-flex ps-5 pe-5 mb-2 thead-print', {
          'custom-sort': useSorting,
        })}
      >
        {columns.map((column) => (
          <Col key={column.id} {...(column.colProps || {})}>
            <div
              className={clx('text-muted cursor-pointer sort', sortColumn === column.id ? sortDirection : '', column.headerClassName)}
              onClick={handleOnSort(column.id)}
            >
              {typeof column.Header === 'function' ? column.Header() : column.Header}
            </div>
          </Col>
        ))}
      </Row>

      {page.map((material, indexCore) => {
        prepareRow(material);
        const {
          original: { materialId, materialCode, materialName, materialBatchNo, priority, producedSizeList },
        } = material;
        return (
          <div key={`${materialId}-${priority}`} className="group-item">
            <div className="pt-2">
              <Row>
                <Badge bg={priority === 'URGENT' ? 'danger' : 'info'} style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg">
                  {indexCore + 1} {'.'} {materialName} {translate.priority}: {priority}
                </Badge>
              </Row>
            </div>
            {producedSizeList?.map((itemB) => {
              const { producedSize, productList } = itemB;
              return (
                <div key={`${producedSize}`} className="group-item">
                  <div className="pt-2">
                    <Row>
                      <Badge style={{ display: 'flex', justifyContent: 'center' }} className="h6 badge-lg">
                        {producedSize}
                      </Badge>
                    </Row>
                  </div>{' '}
                  {productList.map((itemD) => {
                    const { productName } = itemD;

                    return itemD.productionOrderList.map((itemt, subIndex) => {
                      const { productionOrderId } = itemt;
                      const newRowProps = material.getRowProps(rowProps);
                      let tempAmount = 0;
                      let tempRemaining = 0;
                      itemt.itemList.forEach((e) => {
                        const { amount, dueDate, remaining } = e;

                        let number;
                        let unit;
                        let remainingNumber;
                        let remainingUnit;

                        const unitAmount = amount.indexOf(' ');
                        const unitRemain = remaining.indexOf(' ');

                        if (unitAmount !== -1) {
                          number = amount.slice(0, unitAmount);
                          unit = amount.slice(unitAmount + 1);
                          remainingNumber = remaining.slice(0, unitRemain);
                          remainingUnit = remaining.slice(unitRemain + 1);
                        } else {
                          unit = '-';
                          remainingUnit = '-';
                        }
                        const itemAmount = parseFloat(amount);
                        const itemRemaining = parseFloat(remaining);
                        let convertAmount = 0;
                        tempAmount += itemAmount;
                        tempRemaining += itemRemaining;
                        if (unit === 'รีม') convertAmount = useConvertReamToSheet({ value: tempAmount });
                        if (unit === 'แผ่น') convertAmount = useConvertSheetToReam({ value: tempAmount });
                        if (unit === '-') convertAmount = useConvertReamToSheet({ value: tempAmount });

                        itemt.amount = `${convertAmount.ream} รีม ${convertAmount.sheet} แผ่น`;
                        itemt.dueDate = dueDate;
                        itemt.remaining = `${itemRemaining} ${remainingUnit}`;
                        itemt.productName = productName;
                      });
                      tempAmount = 0;
                      return (
                        <Card
                          key={`${itemD.id}-${subIndex}`}
                          id={itemD.id}
                          className="mb-2 pointer-cursor"
                          {...newRowProps}
                          onClick={handleRowClick(newRowProps.onClick, itemD, productionOrderId, material)}
                        >
                          <Card.Body className="pt-0 pb-0 sh-21 sh-md-6">
                            <Row style={{ cursor: 'pointer' }} className="g-0 h-100 align-content-center cursor-default item-print">
                              {columns.map((column) => (
                                <Col
                                  key={column.id}
                                  {...column.colProps}
                                  className={clx('d-flex flex-column justify-content-center mb-2 mb-md-0', column.className)}
                                >
                                  <div className="text-muted text-small d-md-none">{typeof column.Header === 'function' ? column.Header() : column.Header}</div>
                                  <div className="text-truncate h-100 d-flex align-items-center">
                                    {typeof column.Cell === 'function'
                                      ? column.Cell({
                                          value: column.accessor(itemt),
                                          cell: { value: column.accessor(itemt) },
                                          row: { values: itemt },
                                        })
                                      : column.accessor(itemt)}
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    });
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

export default TableGroup;
