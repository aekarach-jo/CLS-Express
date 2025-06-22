/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import Table from 'components/table/Table';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import moment from 'moment';
import useConvert from 'hooks/useConvert';

const searchParcel = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';

  const res = await request({
    url: '/parcel',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const Parcel = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'parcel.title' });
  const description = '';
  const generateId = () => new Date().getTime();
  const { useConvertCurrency } = useConvert();

  const [filter, setFilter] = useState({});
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'parcel.field.zto-track' }),
        accessor: 'zto_track_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '7rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.track' }),
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },

      {
        Header: f({ id: 'parcel.field.name' }),
        accessor: 'name',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.phone' }),
        accessor: 'phone',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'parcel.field.weight' }),
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '4rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.amount' }),
        accessor: 'price_bill',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '6rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.status' }),
        accessor: 'status',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-dark text-center">
              {row.original.status === 'success' && (
                <div className="rounded-sm px-1" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Success
                </div>
              )}
              {row.original.status === 'ready' && (
                <div className="rounded-sm px-1" style={{ background: '#F99600', color: 'white' }}>
                  Ready
                </div>
              )}
              {row.original.status === 'pending' && (
                <div className="rounded-sm px-1" style={{ background: '#5A607F', color: 'white' }}>
                  Pending
                </div>
              )}
              {row.original.status === 'return' && (
                <div className="rounded-sm px-1" style={{ background: '#8d5619', color: 'white' }}>
                  Return
                </div>
              )}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'parcel.field.import' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') : '-' || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.receiptDate' }),
        accessor: 'receipt_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') : '-' || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.datePayment' }),
        accessor: 'payment_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') : '-' || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.statusPayment' }),
        accessor: 'statusPayment',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-dark text-center" style={{ width: '9rem' }}>
              {row.original.bill?.payments.length > 0 && (
                <div className="rounded-sm px-2 w-50 m-auto" style={{ background: '#C4F8E2', color: '#31a775' }}>
                  Paid
                </div>
              )}
              {row.original.bill?.payments.length === 0 && (
                <div className="rounded-sm px-2 w-50 m-auto" style={{ background: '#E6E9F4', color: '#5A607F' }}>
                  Pending
                </div>
              )}
              {row.original.bill === null && <>-</>}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'parcel.field.dateShipping' }),
        accessor: 'shipping_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') : '-' || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'parcel.field.costPrice' }),
        accessor: 'price',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '6rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
    ];
  }, [f]);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      filterTypes: ['name', 'phone'],
      pageCount,
      pageC,
      total,
      initialState: { pageIndex: 0, pageSize: 1000 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const sortByFromTable = ([field]) => {
    if (!field) {
      return {};
    }

    return {
      sortField: field.id,
      sortDirection: field.desc ? 'desc' : 'asc',
    };
  };

  const { isFetching, refetch } = useQuery(
    ['searchParcel', filter, pageSize, sortBy, page],
    () => searchParcel({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        const newArr = result?.data?.map((item) => ({ ...item, num: result.from }));
        setPageC(result.last_page);
        setPageCount(result.last_page);
        setTotal(result.total);
        setData(newArr);
      },
      onSettled(s) {
        console.log(s);
      },
      onError(err) {
        console.log(err);

        console.error('Search error :', err);
      },
    }
  );

  useEffect(() => {
    setFilter({ filters: 'status:neq:success' });
  }, []);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => {
      const newFilter = { ...currentFilter, page: globalFilter !== undefined && 0 };
      if (globalFilter !== '') {
        newFilter.searchText = globalFilter;
      } else {
        delete newFilter.searchText;
      }
      return newFilter;
    });
  }, [globalFilter]);

  const options = [
    { label: 'Pending', value: true },
    { label: 'Ready', value: false },
    { label: 'Success', value: false },
  ];

  const handleExport = async () => {
    try {
      const response = await request({ url: `/export`, method: 'GET', responseType: 'blob', params: { ...filter, sorts: 'created_at:desc', page: undefined } });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parcel_${generateId()}_${moment(new Date()).format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;

  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'parcel');

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} buttons={{ export: { onSubmit: () => handleExport(), isHide: role?.can_export === 0 } }} />
      <Table tableInstance={tableInstance} isLoading={isFetching} statusOptions={options} hideControlsStatusVerify hideControlsStatus hideControlsStatusBill />
    </>
  );
};

export default Parcel;
