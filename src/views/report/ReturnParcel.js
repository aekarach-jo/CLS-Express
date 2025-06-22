/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';

const searchReportReturn = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'id:asc';

  const res = await request({
    url: '/report/return-parcel',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const ReturnParcel = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();
  const title = f({ id: 'menu.import-returnParcel' });
  const description = '';
  const generateId = () => new Date().getTime();

  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'return parcel');

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'report.returnParcel.field.no' }),
        accessor: 'id',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '1.8rem' }}>
            {cell.row.index + cell.row.original.num || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.returnParcel.field.track' }),
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.returnParcel.field.date' }),
        accessor: 'return_date',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.returnParcel.field.deli-car' }),
        accessor: 'delivery_car_no',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '7rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.returnParcel.field.deli-person' }),
        accessor: 'delivery_person',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '3rem' }}>
            {cell.value || '-'}
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
    () => searchReportReturn({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
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

  const handleExport = async () => {
    try {
      const response = await request({ url: `/export/return-parcel`, method: 'GET', responseType: 'blob', params: { sort: 'id:asc', ...filter } });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ReturnParcel_report_${generateId()}_${moment(new Date()).format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} buttons={{ export: { onSubmit: () => handleExport(), isHide: role?.can_export === 0 } }} />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatusVerify
        hideControlsStatusBill
        hideControlsStatusParcel
        hideControlSearch
        hideControlsStatus
      />
    </>
  );
};

export default ReturnParcel;
