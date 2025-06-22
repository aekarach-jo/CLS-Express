/* eslint-disable camelcase */
import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import Table from 'components/table/TablePacking';
import moment from 'moment';
import { request } from 'utils/axios-utils';

const BillList = ({ data, setData, setCheckAll, isLak, isEditMode, setTotalAmount, setAmountLakCurrency, setIsCheckHasChange, isCheckHasChange }) => {
  const { formatMessage: f } = useIntl();
  const [isChange, setIsChange] = useState(false);
  const [amountLakFormCurrency, setAmountLakFormCurrency] = useState({ amount_lak: 0, amount_cny: 0 });

  const searchCurrency = async ({ date, page = 1, per_page = 1, sortBy = {} }) => {
    const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';
    const filter = {
      start_at: moment(date || new Date()).format('YYYY-MM-DD 00:00:00'),
      end_at: moment(date || new Date()).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await request({
      url: '/currency',
      method: 'GET',
      params: { ...filter, per_page, page, sorts },
    });
    return res.data.data.data[0];
  };

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const currencyData = await searchCurrency({ date: data[0].created_at });
        setAmountLakFormCurrency({ amount_lak: currencyData.amount_lak, amount_cny: currencyData.amount_cny });
        setAmountLakCurrency({ amount_lak: currencyData.amount_lak, amount_cny: currencyData.amount_cny });
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, []);

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },

      {
        Header: 'Tracking',
        accessor: 'total_weights',
        sortable: false,
        headerClassName: 'text-alternate text-start',
        Cell: ({ cell }) => {
          return (
            <div className="text-start h-100">
              {cell.row?.original?.parcels?.map((item, index) => (
                <Col key={index} className="sh-3">
                  <div>{item.track_no}</div>
                </Col>
              ))}
            </div>
          );
        },
      },
      {
        Header: 'Status',
        accessor: 'checkedAll',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell, row }) => {
          return (
            <div className="text-center h-100">
              {cell.row?.original?.parcels?.map((item, index) => (
                <Col key={index} className="sh-3">
                  <div className="text-medium text-white text-center" style={{ minWidth: '7rem' }}>
                    {item.checked ? (
                      <div className="rounded-sm w-50 m-auto" style={{ background: '#C4F8E2', color: '#06A561' }}>
                        Checked
                      </div>
                    ) : (
                      <div className="rounded-sm w-50 m-auto" style={{ background: '#F99600', color: 'white' }}>
                        Pending
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'payment.field.bill' }),
        accessor: 'bill_no',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return (
            <div className="text-center h-100" style={{ minWidth: '7rem' }}>
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
        Header: 'Pcs',
        accessor: 'pcs',
        sortable: false,
        headerClassName: 'text-alternate text-start',
        Cell: ({ cell }) => {
          return <div className="text-start h-100">{cell.row?.original?.parcels?.length || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'bill.field.parcel-weight' }),
        accessor: 'total_weight',
        sortable: false,
        headerClassName: 'text-alternate text-end',
        Cell: ({ cell }) => {
          return <div className="text-end h-100">{cell?.value?.toFixed(2) || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.parcel-amount' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-alternate text-end ',
        Cell: ({ cell }) => {
          cell.row.original.amount_cny = Math.ceil((cell.value / (amountLakFormCurrency.amount_cny * amountLakFormCurrency.amount_lak)) * 100) / 100;
          return (
            <div className="text-end h-100">
              {isLak
                ? (Math.ceil(cell.value * 100) / 100)?.toFixed(2)
                : (Math.ceil((cell.value / (amountLakFormCurrency.amount_cny * amountLakFormCurrency.amount_lak)) * 100) / 100).toFixed(2)}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'payment.field.createAt' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return (
            <div className="text-center h-100" style={{ minWidth: '7rem' }}>
              {moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}
            </div>
          );
        },
      },
    ];
  }, [f, isEditMode, amountLakFormCurrency, isLak]);

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
      setPageSize: 100,
      setSelectToShipping: setCheckAll,
      initialState: { pageIndex: 0, hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  useEffect(() => {
    if (data.length > 0) {
      setResult(data);
    } else {
      setResult([]);
    }
  }, [data]);

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

  useEffect(() => {
    setData(data);
    if (isChange) {
      setIsChange(false);
      setIsCheckHasChange(false);
    }
  }, [isChange]);

  useEffect(() => {
    const sumAmountCurrency = result.reduce((acc, item) => (item.checked ? acc + (isLak ? item.amount_lak : item.amount_cny) : acc), 0);
    setTotalAmount(Math.ceil(sumAmountCurrency * 100) / 100);
  }, [isChange, isLak, result, setTotalAmount]);

  const sumWeight = result.reduce((acc, item) => (item.checked ? acc + item.total_weight : acc), 0);
  const sumAmount = result.reduce((acc, item) => (item.checked ? acc + (isLak ? item.amount_lak : item.amount_cny) : acc), 0);

  return (
    <Row>
      <Col xs="12">
        <Card className="p-1">
          <>
            <Table
              tableInstance={tableInstance}
              customStyle={customStyle}
              rowStyle={rowStyle}
              hideControlSearch
              hideControlsPageSize
              hideControlsStatusParcel
              hideControlsStatusVerify
              hideControlsStatusBill
              hideControlsStatus
              isCheckAll={!isEditMode}
              hidePageControl
              hideControlsDateRange
            />
            <Row className="mt-3">
              <Col xs="3" md="1" className="text-center">
                <strong>{f({ id: 'common.total' })}</strong>
              </Col>
              <Col xs="4" md="3" className="text-start">
                <strong>{sumWeight.toFixed(2)}</strong>
              </Col>
              <Col xs="5" md="3" className="text-start">
                <strong>{sumAmount.toFixed(2)}</strong>
              </Col>
            </Row>
          </>
        </Card>
      </Col>
    </Row>
  );
};

export default BillList;
