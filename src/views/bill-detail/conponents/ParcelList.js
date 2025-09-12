import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import Table from 'components/table/TablePacking';
import moment from 'moment';
import useConvert from 'hooks/useConvert';

const ParcelList = ({ data, setData, setCheckAll, isEditMode, setTotalAmount, setIsCheckHasChange, isCheckHasChange, rate }) => {
  const { formatMessage: f } = useIntl();
  const [isChange, setIsChange] = useState(false);
  const { useConvertCurrency } = useConvert();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: f({ id: 'parcel.field.zto-track' }),
        accessor: 'zto_track_no',
        sortable: false,
        headerClassName: 'text-color-red text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.parcel-track-no' }),
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-color-red text-center',
        Cell: ({ cell }) => {
          return (
            <div className="text-center">
              <Form.Check
                className="position-absolute px-4"
                style={{ left: 25 }}
                checked={cell.row.original?.checked}
                onChange={(e) => {
                  cell.row.original.checked = e.target.checked;
                  setIsChange(!isChange);
                  setIsCheckHasChange(!isCheckHasChange);
                  setCheckAll((prev) => {
                    cell.row.original.checked = e.target.checked;
                    const index = prev.findIndex((item) => item.id === cell.row.original.id);
                    if (index === -1) {
                      return [...prev, cell.row.original];
                    }
                    return prev.filter((item) => item.id !== cell.row.original.id);
                  });
                }}
                type="checkbox"
                label=""
                hidden={!isEditMode}
              />
              {cell?.value || '-'}
            </div>
          );
        },
      },

      {
        Header: f({ id: 'bill.field.parcel-weight' }),
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-color-red text-end',
        Cell: ({ cell }) => {
          return <div className="text-end">{cell?.value?.toFixed(2) || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'bill.field.parcel-price' }),
        accessor: 'price',
        sortable: false,
        headerClassName: 'text-color-red text-end',
        Cell: ({ cell }) => {
          let calculatedPrice = 0;
          const { weight, customer_level: customerLevel } = cell.row.original;

          if (rate) {
            // ถ้ามี rate จากภายนอก ให้ใช้ rate นั้น
            calculatedPrice = weight * rate;
          } else if (customerLevel && customerLevel.rate_weights && customerLevel.rate_weights.length > 0) {
            // ถ้ามี customer_level และ rate_weights
            const rateWeights = customerLevel.rate_weights.sort((a, b) => a.weight - b.weight);
            let selectedRate = customerLevel.rate; // default rate ถ้าหาไม่เจอ

            // console.log('weight ', weight);
            // console.log('rateWeights ', rateWeights);
            // console.log('selectedRate ', selectedRate);

            // ปัดน้ำหนักแบบปกติ (0.64 -> 0.6, >0.65 -> 0.7)
            const roundedWeight = Math.round(weight * 10) / 10;

            // หา rate ตามน้ำหนักที่ปัดแล้ว
            const foundRate = rateWeights.find((rateWeight) => roundedWeight <= rateWeight.weight);
            // console.log("foundRate ", foundRate);
            if (foundRate) {
              selectedRate = foundRate.rate;
            }

            // ถ้าน้ำหนักมากกว่าค่าสูงสุดใน rate_weights ให้ใช้ rate หลัก
            if (roundedWeight > rateWeights[rateWeights.length - 1].weight) {
              selectedRate = customerLevel.rate;
            }

            calculatedPrice = selectedRate;
          } else {
            // ถ้าไม่มี customer_level หรือ rate_weights ให้ใช้ price_bill
            calculatedPrice = cell.row.original.price_bill;
          }

          const roundedValue = Math.ceil(calculatedPrice / 1000) * 1000;
          // console.log('calculatedPrice:', calculatedPrice);
          // console.log('Rounded Value:', roundedValue);
          cell.value = roundedValue;
          return <div className="text-end">{useConvertCurrency(roundedValue, 0)}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.importDate' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-color-red text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell.value ? moment(cell.value).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.shippingDate' }),
        accessor: 'shipping_at',
        sortable: false,
        headerClassName: 'text-color-red text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell.value ? moment(cell.value).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>;
        },
      },
    ];
  }, [f, isChange, isCheckHasChange, isEditMode, rate, setCheckAll, setIsCheckHasChange]);

  const [result, setResult] = useState(data || []);

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      // manualPagination: false,
      // manualFilters: false,
      // manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      setSelectToShipping: setCheckAll,
      initialState: { pageIndex: 0, hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  useEffect(() => {
    if (data?.length > 0) {
      setResult(data);
    } else {
      setResult([]);
    }
  }, [data]);

  useEffect(() => {
    setData(data);
    if (isChange) {
      setIsChange(false);
      setIsCheckHasChange(false);
    }
  }, [isChange]);
  const rowStyle = {
    height: '40px',
    border: '1px solid rgba(0, 0, 0, 0)',
    borderWidth: '1px 0',
    background: 'var(--foreground)',
  };

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '1ภpx',
  };
  // const sumAmount = result.reduce((acc, item) => acc + Math.ceil(item.price / 1000) * 1000, 0);

  // Helper function to calculate price based on weight and customer level
  const calculatePrice = (item) => {
    const { weight, customer_level: customerLevel } = item;

    if (rate) {
      return weight * rate;
    }

    if (customerLevel && customerLevel.rate_weights && customerLevel.rate_weights.length > 0) {
      const rateWeights = customerLevel.rate_weights.sort((a, b) => a.weight - b.weight);
      let selectedRate = customerLevel.rate;

      // หา rate ตามน้ำหนัก
      const foundRate = rateWeights.find((rateWeight) => weight <= rateWeight.weight);
      if (foundRate) {
        selectedRate = foundRate.rate;
      }

      // ถ้าน้ำหนักมากกว่าค่าสูงสุดใน rate_weights ให้ใช้ rate หลัก
      if (weight > rateWeights[rateWeights.length - 1].weight) {
        selectedRate = customerLevel.rate;
      }

      return selectedRate;
    }

    return item.price_bill;
  };

  useEffect(() => {
    const sumAmountCurrency = result.reduce(
      (acc, item) => (item.checked ? acc + Math.ceil(calculatePrice(item) / 1000) * 1000 : acc),
      0
    );
    setTotalAmount(Math.ceil(sumAmountCurrency * 100) / 100);
  }, [isChange, result, setTotalAmount, rate]);

  const sumAmount = result.reduce((acc, item) => (item.checked ? acc + Math.ceil(calculatePrice(item) / 1000) * 1000 : acc), 0);

  return (
    <Row>
      <Col xs="12">
        <Card.Body className="half-padding">
          <>
            <Table
              tableInstance={tableInstance}
              customStyle={customStyle}
              rowStyle={rowStyle}
              hideControlSearch
              hideControlsPageSize
              hideControlsDateRange
              hideControlsStatus
              hideControlsStatusParcel
              hideControlsStatusVerify
              hideControlsStatusBill
              hideAddDelete
              isCheckAll={isEditMode}
              isPage
            />
            <Row className="mt-3" style={{ fontSize: '1.2rem' }}>
              <Col xs="3" className="text-center">
                <strong>{f({ id: 'common.total' })}</strong>
              </Col>
              <Col xs="3" className="text-start">
                <strong>{useConvertCurrency(sumAmount, 0)}</strong>
              </Col>
            </Row>
          </>
        </Card.Body>
      </Col>
    </Row>
  );
};

export default ParcelList;
