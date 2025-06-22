/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import React, { useEffect, useMemo, useState } from 'react';
import { request } from 'utils/axios-utils';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { useQuery } from 'react-query';
import moment from 'moment';
import useConvert from 'hooks/useConvert';

const searchReportIncome = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'id:asc';

  const res = await request({
    url: '/report/income-expenses',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const IncomeExpenses = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'menu.import-income' });
  const description = '';
  const generateId = () => new Date().getTime();
  const { useConvertCurrency } = useConvert();
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'income / expenses');

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'report.income.field.no' }),
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
        Header: f({ id: 'report.income.field.date' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '9rem' }}>
            {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') : '-' || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.income.field.description' }),
        accessor: 'description',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '5rem' }}>
              {cell.value || '-'}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'report.income.field.billNo' }),
        accessor: 'bill_reference',
        sortable: false,
        headerClassName: 'text-medium',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '5rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.income.field.amount' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-center',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium text-end" style={{ width: '6rem' }}>
              {useConvertCurrency(cell.value, 2) || '-'}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'report.income.field.shipping' }),
        accessor: 'shipping_lak',
        sortable: false,
        headerClassName: 'text-medium text-center',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium text-end" style={{ width: '6rem' }}>
              {useConvertCurrency(cell.value, 2) || '-'}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'report.income.field.topUp' }),
        accessor: 'top_up_lak',
        sortable: false,
        headerClassName: 'text-medium text-center',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '6rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.income.field.expenses' }),
        accessor: 'expenses_lak',
        sortable: false,
        headerClassName: 'text-medium text-center',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '6rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'report.income.field.balance' }),
        accessor: 'balance_amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-center',
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

  const { isFetching } = useQuery(
    ['searchParcel', filter, pageSize, sortBy, page],
    () => searchReportIncome({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
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
      const response = await request({ url: `/export/income-expenses`, method: 'GET', responseType: 'blob', params: { sort: 'id:asc', ...filter } });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IncomeExpenses_report_${generateId()}_${moment(new Date()).format('YYYY-MM-DD')}.xlsx`);
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

export default IncomeExpenses;
