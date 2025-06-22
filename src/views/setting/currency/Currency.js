/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import { request } from 'utils/axios-utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import moment from 'moment';
import useConvert from 'hooks/useConvert';

const searchCurrency = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'updated_at:desc';

  const res = await request({
    url: '/currency',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const Currency = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'currency.title' });
  const description = '';

  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [getId, setGetId] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const { useConvertCurrency } = useConvert();
  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'currency');

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'currency.field.no' }),
        accessor: 'id',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '1.8rem' }}>
              {cell.row.index + cell.row.original.num || '-'}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'currency.field.date' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium"> {cell?.value ? moment(cell?.value || '-').format('YYYY-MM-DD') : '-' || '-'}</div>,
      },
      {
        Header: f({ id: 'currency.field.lak' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => <div className="text-medium text-end">{useConvertCurrency(cell.value, 2) || '-'}</div>,
      },
      // {
      //   Header: f({ id: 'currency.field.updateAt' }),
      //   accessor: 'updated_at',
      //   sortable: false,
      //   headerClassName: 'text-medium text-muted-re',
      //   Cell: ({ cell }) => <div className="text-medium">{moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}</div>,
      // },
      {
        Header: '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ row }) => (
          <div className="text-medium d-flex flex-row gap-1 icon-hover align-items-end justify-content-end float-right" style={{ width: '3rem' }}>
            <div>
              <NavLink
                to={`${role?.can_view === 0 ? `/setting/currency` : `/setting/currency/${row.values.id}?view`}`}
                className=" text-truncate h-100 d-flex align-items-center"
              >
                <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} />
              </NavLink>
            </div>
            {/* <div>
              <img src="/img/icons/edit.png" alt="edit" />
            </div>
            <div>
              <img src="/img/icons/delete.png" alt="delete" />
            </div> */}
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
    ['searchCustomer', filter, pageSize, sortBy, page],
    () => searchCurrency({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
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

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    await request({ url: `/customer/${getId}`, method: 'DELETE' });
    refetch();
    setIsDeleting(false);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        // buttons={{ export: { onSubmit: () => {} } }}
        // addButton={{ label: f({ id: 'currency.field.add' }), link: '/setting/currency/new' }}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsDateRange
        hideControlsStatusParcel
        hideControlsStatusVerify
        hideControlsStatus
        hideControlsStatusBill
        hideControlSearch
        isCurrencyDate
      />
    </>
  );
};

export default Currency;
