/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import clx from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { request } from 'utils/axios-utils';
import ReactToPrint from 'react-to-print';
import { Button, Form, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import ConfirmDeleteModal from 'components/confirm-delete-modal/ConfirmDeleteModal';
import { useQuery } from 'react-query';
import moment from 'moment';
import useConvert from 'hooks/useConvert';
import PaymentSlip from './paymentSlip';
import './paymentSlip.css';

const searchPayment = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  // if (sortBy.sortField === 'created_at' || sortBy.sortField === 'updated_at') {
  //   sortBy.sortField = `bills.${sortBy.sortField}`;
  // }
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';

  const res = await request({
    url: '/payment',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const Payment = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();
  const title = f({ id: 'payment.title' });
  const description = '';
  const generateId = () => new Date().getTime();
  const componentRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [getId, setGetId] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const [dataToPrint, setDataToPrint] = useState();
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [selectPrint, setSelectPrint] = useState(false);
  const { useConvertCurrency } = useConvert();

  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'payment');

  const handleConfirm = () => {
    setIsConfirmModal(false);
    setSelectPrint('')
    return <ReactToPrint trigger={() => setIsConfirmModal(false)} content={() => componentRef.current} />;
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
    setSelectPrint('')
  };

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'payment.field.no' }),
        accessor: 'payment_id',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '2rem' }}>
              <div>{cell.row.index + cell.row.original.num || '-'}</div>
            </div>
          );
        },
      },
      {
        Header: f({ id: 'payment.field.bill' }),
        accessor: 'bill_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '5.4rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'payment.field.payNo' }),
        accessor: 'payment_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value.split('-').slice(0, 2).join('-') || '-'}</div>,
      },
      {
        Header: f({ id: 'payment.field.name' }),
        accessor: 'name',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'payment.field.phone' }),
        accessor: 'phone',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'payment.field.amount' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => <div className="text-medium text-end">{useConvertCurrency(cell.value, 2) || '-'}</div>,
      },
      {
        Header: f({ id: 'payment.field.status' }),
        accessor: 'status',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-center" style={{ width: '4rem' }}>
              {row.original.status === 'paid' ? (
                <div className="rounded-sm" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Paid
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
        Header: f({ id: 'payment.field.createAt' }),
        accessor: 'pay_created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '8.2rem' }}>
              {moment.utc(cell?.value).format('YYYY-MM-DD HH:mm:ss') || '-'}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'payment.field.updateAt' }),
        accessor: 'pay_updated_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '11rem' }}>
            {moment.utc(cell?.value).format('YYYY-MM-DD HH:mm:ss') || '-'}
          </div>
        ),
      },
      {
        Header: '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ row }) => {
          return (
            <div className="text-medium d-flex flex-row gap-1 icon-hover" style={{ width: '4rem' }}>
              <div>
                <NavLink
                  to={`${role?.can_view === 0 ? `/payment` : `/payment/${row.original.payment_no}?${row.original.status === 'pending' ? 'edit' : 'view'}`}`}
                  className=" text-truncate h-100 d-flex align-items-center"
                >
                  <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} />
                </NavLink>
                <div />
              </div>
              <div>
                {row.original.status ? (
                  <img
                    className="cursor-pointer"
                    src="/img/icons/download.png"
                    alt="trunk"
                    onClick={() => {
                      setIsConfirmModal(true);
                      setDataToPrint(row.original);
                    }}
                  />
                ) : (
                  <img className="opacity-50" src="/img/icons/download.png" alt="trunk" />
                )}
              </div>
              <div className="cursor-pointer">
                {row.original.status !== 'paid' && role?.can_delete !== 0 ? (
                  <img
                    src="/img/icons/delete.png"
                    alt="delete"
                    onClick={() => {
                      setIsDeleting(true);
                      setGetId(row.values.payment_no);
                    }}
                  />
                ) : (
                  <img className="d-none" src="/img/icons/delete.png" alt="delete" />
                )}
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
    ['searchPayment', filter, pageSize, sortBy, page],
    () => searchPayment({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }),
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
  const options = [
    { label: 'Pending', value: true },
    { label: 'Paid', value: false },
  ];

  const handleConfirmDelete = async () => {
    await request({ url: `/payment/${getId}`, method: 'DELETE' });
    refetch();
    setIsDeleting(false);
  };

  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          animation
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Row className="my-4">
                <div className="d-flex flex-row justify-content-start align-items-center gap-2">
                  <Form.Check
                    type="radio"
                    label="A4"
                    id="inlineRadio1"
                    inline
                    name="inlineRadio"
                    className="d-flex flex-row justify-content-start align-items-center gap-2"
                    onChange={() => setSelectPrint('A4')}
                    checked={selectPrint === 'A4'}
                  />
                  <Form.Check
                    type="radio"
                    label="A5"
                    id="inlineRadio1"
                    inline
                    name="inlineRadio"
                    className="d-flex flex-row justify-content-start align-items-center gap-2"
                    onChange={() => setSelectPrint('A5')}
                    checked={selectPrint === 'A5'}
                  />
                  <Form.Check
                    type="radio"
                    label="Receipt"
                    id="inlineRadio2"
                    inline
                    name="inlineRadio"
                    className="d-flex flex-row justify-content-start align-items-center gap-2"
                    onChange={() => setSelectPrint('slip')}
                    checked={selectPrint === 'slip'}
                  />
                </div>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="primary" size="small" onClick={onConfirm} disabled={loading || !selectPrint}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        addButton={{ label: f({ id: 'common.add' }), link: '/payment/new' }}
        isHideBtnAdd={role?.can_create === 0}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatusParcel
        hideControlsStatusBill
        hideControlsDateRange
        hideControlsStatusVerify
        hideControlsStatus
        isPaymentStatus
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
      <ConfirmModal
        show={isConfirmModal}
        titleText={f({ id: 'common.print' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <div id="printing">
        <PaymentSlip
          ref={(el) => {
            componentRef.current = el;
          }}
          data={dataToPrint}
          printType={selectPrint}
        />
      </div>
    </>
  );
};

export default Payment;
