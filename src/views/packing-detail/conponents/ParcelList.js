import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import Table from 'components/table/TablePacking';
import moment from 'moment';

const ParcelList = ({ data, setData, setCheckAll, isEditMode, setTotalAmount, setIsCheckHasChange, isCheckHasChange, rate }) => {
  const { formatMessage: f } = useIntl();
  const [isChange, setIsChange] = useState(false);
  const [trackNo, setTrackNo] = useState('');
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: 'Bill No.',
        accessor: 'bill_no',
        sortable: false,
        headerClassName: 'text-muted text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: 'Track No.',
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-muted text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: 'Weight',
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-muted text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell.row.original.weight?.toFixed(2) || '-'}</div>;
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-white text-center" style={{ minWidth: '5rem' }}>
              {row.original.status === 'checked' && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Checked
                </div>
              )}
              {row.original.status === 'pending' && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#F99600', color: 'white' }}>
                  Pending
                </div>
              )}
            </div>
          );
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
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
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

  useEffect(() => {
    const sumAmountCurrency = result.reduce(
      (acc, item) => (item.checked ? acc + Math.ceil((rate ? item.weight * rate : item.price_bill) / 1000) * 1000 : acc),
      0
    );
    setTotalAmount(Math.ceil(sumAmountCurrency * 100) / 100);
  }, [isChange, result, setTotalAmount]);

  const handleChange = (e) => {
    setTrackNo(e.target.value);
    console.log(e.target.value);
    setData((prev) => {
      return prev.map((item) => {
        if (item.track_no === e.target.value) {
          setTimeout(() => {
            setTrackNo('');
          }, 400);
          clearTimeout();
          return { ...item, status: 'checked' };
        }
        return item;
      });
    });
  };

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
              hidePageControl
              isPage
            />
            <Row className="mt-3 justify-content-end">
              <Col xs="1" className="text-center">
                <Form.Label className="col-form-label required">Track No.</Form.Label>
              </Col>
              <Col xs="2" className="text-center">
                <Form.Control type="text" name="address" onChange={handleChange} value={trackNo || ''} readOnly={!isEditMode} />
              </Col>
            </Row>
          </>
        </Card.Body>
      </Col>
    </Row>
  );
};

export default ParcelList;
