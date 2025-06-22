import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Card, Col, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import Table from 'components/table/Table';
import useConvert from 'hooks/useConvert';

const ParcelList = ({ data }) => {
  const { formatMessage: f } = useIntl();
  const { useConvertCurrency } = useConvert();

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'income.field.parcel-track-no' }),
        accessor: 'zto_track_no',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'income.field.track-no' }),
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'income.field.parcel-weight' }),
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value.toFixed(2) || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'income.field.parcel-price' }),
        accessor: 'price_bill',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{useConvertCurrency(cell.value, 2) || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'income.field.receipt' }),
        accessor: 'receipt_at',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell.value}</div>;
        },
      },
      {
        Header: f({ id: 'income.field.shippingDate' }),
        accessor: 'shipping_at',
        sortable: false,
        headerClassName: 'text-alternate text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell.value}</div>;
        },
      },
    ];
  }, [f]);

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
  return (
    <Row>
      <Col xs="12">
        <Card.Body className="half-padding">
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
            isPage
          />
        </Card.Body>
      </Col>
    </Row>
  );
};

export default ParcelList;
