/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import { useQuery } from 'react-query';
import Table from 'components/table/Table';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import ConfirmDeleteModal from 'components/confirm-delete-modal/ConfirmDeleteModal';
import moment from 'moment';

const searchRole = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'updated_at:desc';

  const res = await request({
    url: '/role',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const Role = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'role.title' });
  const description = '';

  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [getId, setGetId] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'role & permission');

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'role.field.no' }),
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
        Header: f({ id: 'role.title' }),
        accessor: 'name',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'role.field.status' }),
        accessor: 'active',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-start',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-center" style={{ width: '4rem' }}>
              {row.original.active ? (
                <div className="rounded-sm m-auto" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Active
                </div>
              ) : (
                <div className="rounded-sm m-auto" style={{ background: '#E6E9F4', color: '#5A607F' }}>
                  Inactive
                </div>
              )}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'role.field.createAt' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '10rem' }}>
            {moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'role.field.updateAt' }),
        accessor: 'updated_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '10rem' }}>
            {moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}
          </div>
        ),
      },
      {
        Header: '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ row }) => (
          <div className="text-medium d-flex flex-row gap-1 icon-hover" style={{ width: '3rem' }}>
            <div>
              <NavLink
                to={`${role?.can_view === 0 ? `/setting/role` : `/setting/role/${row.values.id}?view`}`}
                className=" text-truncate h-100 d-flex align-items-center"
              >
                <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} />
              </NavLink>
            </div>
            <div>
              {role?.can_update === 0 ? (
                <div
                  className=" text-truncate h-100 d-flex align-items-center"
                  style={row.values.status === 'verify' || role?.can_update === 0 ? { opacity: '0.5', cursor: 'auto' } : { cursor: 'pointer' }}
                >
                  <img src="/img/icons/edit.png" alt="edit" />
                </div>
              ) : (
                <NavLink to={`/setting/role/${row.values.id}?edit`} className=" text-truncate h-100 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                  <img src="/img/icons/edit.png" alt="edit" />
                </NavLink>
              )}
            </div>
            <div
              className="cursor-pointer"
              style={role?.can_delete === 0 ? { opacity: '0.5', cursor: 'auto' } : { cursor: 'pointer' }}
              onClick={() => {
                if (role?.can_delete !== 0) {
                  setIsDeleting(true);
                  setGetId(row.values.id);
                }
              }}
            >
              <img src="/img/icons/delete.png" alt="delete" />
            </div>
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
    ['searchRole', filter, pageSize, sortBy, page],
    () => searchRole({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
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

  const handleConfirmDelete = async () => {
    await request({ url: `/role/${getId}`, method: 'DELETE' });
    refetch();
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        addButton={{ label: f({ id: 'role.field.add' }), link: '/setting/role/new' }}
        isHideBtnAdd={role?.can_create === 0}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatusBill
        hideControlsStatusParcel
        hideControlsStatusVerify
        hideControlsDateRange
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

export default Role;
