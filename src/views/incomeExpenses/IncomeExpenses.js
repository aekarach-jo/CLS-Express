/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import ConfirmDeleteModal from 'components/confirm-delete-modal/ConfirmDeleteModal';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import { useQuery } from 'react-query';
import useConvert from 'hooks/useConvert';

const searchIncome = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'updated_at:desc';

  const res = await request({
    url: '/income-expenses',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const IncomeExpenses = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();
  const title = f({ id: 'income.title' });
  const description = '';
  const generateId = () => new Date().getTime();
  const { useConvertCurrency } = useConvert();

  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [getId, setGetId] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);

  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'income / expenses');

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'income.field.no' }),
        accessor: 'id',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.row.index + cell.row.original.num || '-'}</div>,
      },
      {
        Header: f({ id: 'income.field.type' }),
        accessor: 'type',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'income.field.description' }),
        accessor: 'description',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium" style={{ width: '20rem' }}>{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'income.field.amount' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => <div className="text-medium text-end">{useConvertCurrency(cell.value, 2) || '-'}</div>,
      },
      {
        Header: f({ id: 'income.field.status' }),
        accessor: 'status',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-center">
              {row.original.status === 'verify' ? (
                <div className="rounded-sm" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Verify
                </div>
              ) : (
                <div className="rounded-sm" style={{ background: '#E6E9F4', color: '#5A607F' }}>
                  Pending
                </div>
              )}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'income.field.createAt' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}</div>,
      },
      {
        Header: f({ id: 'income.field.updateAt' }),
        accessor: 'updated_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}</div>,
      },
      {
        Header: '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ row }) => {
          return (
            <div className="text-medium d-flex flex-row gap-1 icon-hover">
              <div>
                <NavLink
                  to={`${role?.can_view === 0 ? `/income` : `/income/${row.values.id}?view`}`}
                  className=" text-truncate h-100 d-flex align-items-center"
                >
                  <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} />
                </NavLink>
              </div>
              <div>
                {row?.values?.status === 'verify' || role?.can_update === 0 ? (
                  <div
                    className=" text-truncate h-100 d-flex align-items-center"
                    style={row.values.status === 'verify' || role?.can_update === 0 ? { opacity: '0.5', cursor: 'auto' } : { cursor: 'pointer' }}
                  >
                    <img src="/img/icons/edit.png" alt="edit" />
                  </div>
                ) : (
                  <NavLink to={`/income/${row.values.id}?edit`} className=" text-truncate h-100 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <img src="/img/icons/edit.png" alt="edit" />
                  </NavLink>
                )}
              </div>
              <div
                className="cursor-pointer"
                style={row.values.status === 'verify' && role?.can_delete === 0 ? { opacity: '0.5', cursor: 'auto' } : { cursor: 'pointer' }}
                onClick={() => {
                  if (row.values.status !== 'verify' && role?.can_delete !== 0) {
                    setIsDeleting(true);
                    setGetId(row.values.id);
                  }
                }}
              >
                <img src="/img/icons/delete.png" alt="delete" />
              </div>
            </div>
          );
        },
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
    ['searchIncome-expenses', filter, pageSize, sortBy, page],
    () => searchIncome({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
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
    await request({ url: `/income-expenses/${getId}`, method: 'DELETE' });
    refetch();
    setIsDeleting(false);
  };

  const options = [
    { label: 'Pending', value: true },
    { label: 'Verify', value: false },
  ];
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        addButton={{ label: f({ id: 'common.add' }), link: '/income/new' }}
        isHideBtnAdd={role?.can_create === 0}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatus
        hideControlsStatusParcel
        hideControlsDateRange
        hideControlsStatusBill
        statusOptions={options}
      />
      <ConfirmDeleteModal
        show={isDeleting}
        className="rounded-sm"
        titleText="Delete"
        size="md"
        confirmText="Are you sure you want to delete ?"
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};
export default IncomeExpenses;
