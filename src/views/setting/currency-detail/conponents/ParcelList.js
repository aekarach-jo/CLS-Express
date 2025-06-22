import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Button, Card, Col, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import Table from 'components/table/Table';

const searchProductionData =
  ({ filter, id, planOptionsList, f }) =>
  async () => {
    const productionFilterData = await request({ url: `/productionPlan/productionOrderList`, params: { ...filter } });
    const arr = [];
    productionFilterData.data.data.forEach((data) => {
      data.productSubType.forEach((dataSubType) => {
        dataSubType.itemList.forEach((dataItemlist) => {
          let currentStep;
          if (dataItemlist?.currentStep?.step?.toString().length === 3) {
            dataItemlist.currentStep = dataItemlist?.parentStep;
            currentStep = dataItemlist.currentStep;
          } else {
            currentStep = dataItemlist.currentStep;
          }
          const findStep = planOptionsList.find((itemF) => itemF?.value === (dataItemlist?.currentStep?.step || ''));
          arr.push({
            ...dataItemlist,
            currentStep: {
              ...findStep,
              ...currentStep,
              label: `${findStep?.label || `${f({ id: 'dailyPlan.field.notStart' })}`} ${currentStep?.status ? `( ${currentStep?.status} )` : ''}`,
            },
          });
        });
      });
    });
    const filterData = arr.filter((item) => item.id !== id);
    return filterData;
  };

const ParcelList = ({ show, relatedId, onAdd, id, size, onRemove, handleChange }) => {
  const { formatMessage: f } = useIntl();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: f({ id: 'payment.field.parcel-track-no' }),
        accessor: 'productName',
        sortable: true,
        headerClassName: 'text-uppercase',
        Cell: ({ cell }) => {
          return <div>{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.parcel-track-no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-uppercase text-center',
        Cell: ({ cell }) => {
          return <div>{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.parcel-weight' }),
        accessor: 'weight',
        sortable: true,
        headerClassName: 'text-uppercase text-start',
        Cell: ({ cell }) => {
          return <div>{cell?.value?.label || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.parcel-price' }),
        accessor: 'price',
        sortable: true,
        headerClassName: 'text-uppercase text-end',
        Cell: ({ cell }) => {
          return <div>{cell.value}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.receipt' }),
        accessor: 'receipt',
        sortable: true,
        headerClassName: 'text-uppercase text-end',
        Cell: ({ cell }) => {
          return <div>{cell.value}</div>;
        },
      },
      {
        Header: f({ id: 'payment.field.shippingDate' }),
        accessor: 'shippingDate',
        sortable: true,
        headerClassName: 'text-uppercase text-end',
        Cell: ({ cell }) => {
          return <div>{cell.value}</div>;
        },
      },
    ];
  }, [f, relatedId]);

  const getLocalStorageSubType = localStorage.getItem('productSubTypeCode');
  const filter = { producedProductSize: localStorage.getItem('producedProductSize') || '', productSubTypeCode: getLocalStorageSubType };
  const [result, setResult] = useState([]);
  const [resultBase, setResultBase] = useState([]);
  const [pageSize, setPageSizeCn] = useState(10);

  const addOrRemoveRm = (value) => {
    let isExisted = false;
    isExisted = relatedId === value.productionOrderId;
    if (isExisted) {
      setPageSizeCn(10);
      onRemove(value.productionOrderId);
      setResult(resultBase);
    } else {
      setPageSizeCn(100);
      const selectedItem = resultBase.filter((item) => item.productionOrderId === value.productionOrderId);
      onAdd?.(value?.productionOrderId);
      handleChange({ target: { id: 'relatedProductionOrderValue', value: value?.productionOrderNo } });
      setResult(selectedItem);
    }
  };

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
      addOrRemoveRm,
      initialState: { pageIndex: 0, hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const { setPageSize } = tableInstance;

  useEffect(() => {
    if (show) {
      setPageSize(pageSize);
      setPageSizeCn(10);
    }
  }, [show, setPageSize, pageSize]);

  const { isFetching } = useQuery(
    ['findProductionFilterData', filter, id],
    searchProductionData({
      filter: { ...filter, statusMulti: `NOTSTART,INPROGRESS,SUBMITTED` },
      id,
      planOptionsList,
      f,
    }),
    {
      enabled: !!show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const selectedItem = resp.filter((item) => item.productionOrderId === relatedId);
        setResultBase(resp);
        if (selectedItem.length > 0) {
          setResult(selectedItem || []);
        } else {
          setResult(resp || []);
        }
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

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
          <Table tableInstance={tableInstance} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} hideControlSearch hideControlsPageSize />
        </Card.Body>
      </Col>
    </Row>
  );
};

export default ParcelList;
