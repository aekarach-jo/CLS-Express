/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import clx from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { request } from 'utils/axios-utils';
import ReactToPrint from 'react-to-print';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import ConfirmDeleteModal from 'components/confirm-delete-modal/ConfirmDeleteModal';
import { useMutation, useQuery } from 'react-query';
import moment from 'moment';
import useConvert from 'hooks/useConvert';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';

const searchTopup = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const res = await request({
    url: '/credit/report-topup',
    method: 'GET',
    params: { ...filter },
  });
  return res.data;
};
const callAddTopup = async (data = {}) => {
  const res = await request({ url: `/credit/topup`, method: 'POST', data });
  return res;
};

const Topup = () => {
  const { formatMessage: f } = useIntl();
  const description = '';
  const componentRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('Balance');
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
    return <ReactToPrint trigger={() => setIsConfirmModal(false)} content={() => componentRef.current} />;
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };

  const columns = useMemo(() => {
    return [
      {
        Header: 'No.',
        accessor: 'payment_id',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '2rem' }}>
              <div>{cell.row.index + 1 || '-'}</div>
            </div>
          );
        },
      },
      {
        Header: 'ZTO Track No.',
        accessor: 'zto_track_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: 'Track No.',
        accessor: 'track_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '8rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: 'Weight',
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-end',
        Cell: ({ cell }) => <div className="text-medium text-end">{cell.value || '-'}</div>,
      },
      {
        Header: 'Cost price',
        accessor: 'price',
        sortable: false,
        headerClassName: 'text-medium text-muted-re  text-end',
        Cell: ({ cell }) => <div className="text-medium  text-end">{cell.value || '-'}</div>,
      },
      {
        Header: 'Balance',
        accessor: 'balance_amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '6rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: 'Import date',
        accessor: 'import_at',
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
    ['searchTopup', filter, pageSize, sortBy, page],
    () => searchTopup({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        const newArr = result?.parcel_balance?.map((item, index) => ({ ...item, num: result.from + index }));

        console.log(result.topup);
        setTitle(`Balance : ${result?.topup} LAK`);
        setData(newArr);
        setTotal(result.total);
      },
      onSettled(s) { },
      onError(err) {
        console.log(err);

        console.error('Search error :', err);
      },
    }
  );

  // useEffect(() => {
  //   setFilter((currentFilter) => ({
  //     ...currentFilter,
  //     page,
  //   }));
  // }, [page]);

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
    const [isLak, setIsLak] = useState(true);
    const onClickSwitchLak = () => {
      setIsLak(!isLak);
    };

    const formik = useFormik({ initialValues: {}, enableReinitialize: true });
    const { handleSubmit, handleChange, values, touched, errors } = formik;
    const onChangeNumber = (name, e) => {
      if (/^[0-9]*$/.test(e.target.value)) {
        handleChange({ target: { id: [name], value: Number(e.target.value) } });
      }
    };

    const { mutate: saveTopup, isLoading: isSaving } = useMutation((currentData) => callAddTopup(currentData), {
      onSuccess() {
        toast('success');
        refetch();
        onCancel();
      },
      onError(error) {
        if (error.response) {
          toast.error(() => {
            return (
              <div style={{ width: 'auto' }}>
                {error.response.data.errors.map((item, index) => (
                  <div className="mb-2" key={index}>
                    {item}
                    <hr />
                  </div>
                ))}
              </div>
            );
          });
        }
      },
    });

    const handleSave = () => {
      const formData = {
        pay_cash: values?.pay_cash || null,
        pay_transfer: values?.pay_transfer || null,
        pay_alipay: values?.pay_alipay || null,
        pay_wechat: values?.pay_wechat || null,
        description: values?.description,
        amount: isLak ? Number(values?.pay_cash || 0 + values?.pay_transfer || 0) : Number(values?.pay_alipay || 0 + values?.pay_wechat || 0) * values.currency,
        bank: values?.bank,
      };

      saveTopup(formData);
    };

    return (
      <>
        <Modal show={show} onHide={onCancel} animation contentClassName={clx({ 'overlay-spinner': isSaving })} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Add Top up</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col sm="3 " md="3 " lg="3 ">
                <Form.Label className="col-form-label required">Description</Form.Label>
                <Form.Control type="text" name="description" onChange={handleChange} value={values.description} />
              </Col>
              <Col sm="3 " md="3 " lg="3 ">
                <Form.Label className="col-form-label required">Bank</Form.Label>
                <Form.Control type="text" name="bank" onChange={handleChange} value={values.bank} />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col sm="8" md="8" lg="10">
                &nbsp;
              </Col>
              <Col xs="6" sm="4" md="4" lg="2" className="d-flex justify-content-center">
                <Button className="btn-icon w-100" variant="primary" onClick={() => onClickSwitchLak()}>
                  {isLak ? (
                    <div className="d-flex flex-row justify-content-center gap-2">
                      <p style={{ background: 'white', color: 'black', padding: '0px 12px', borderRadius: '5px' }}>LAK</p>/<p>CNY</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-row justify-content-center gap-2">
                      <p>LAK</p>/<p style={{ background: 'white', color: 'black', padding: '0px 12px', borderRadius: '5px' }}>CNY</p>
                    </div>
                  )}
                </Button>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="3">
                <Form.Label className="col-form-label required">Cash</Form.Label>
                <Form.Control type="text" name="pay_cash" onChange={(e) => onChangeNumber('pay_cash', e)} value={values.pay_cash} readOnly={!isLak} />
              </Col>
              <Col sm="12" md="12" lg="3">
                <Form.Label className="col-form-label required">Transfer</Form.Label>
                <Form.Control
                  type="text"
                  name="pay_transfer"
                  onChange={(e) => onChangeNumber('pay_transfer', e)}
                  value={values.pay_transfer}
                  readOnly={!isLak}
                />
              </Col>
              <Col sm="12" md="12" lg="3">
                <Form.Label className="col-form-label required">Wechat Pay</Form.Label>
                <Form.Control type="text" name="pay_alipay" onChange={(e) => onChangeNumber('pay_alipay', e)} value={values.pay_alipay} readOnly={isLak} />
              </Col>
              <Col sm="12" md="12" lg="3">
                <Form.Label className="col-form-label required">Alipay</Form.Label>
                <Form.Control type="text" name="pay_wechat" onChange={(e) => onChangeNumber('pay_wechat', e)} value={values.pay_wechat} readOnly={isLak} />
              </Col>
            </Row>
            <Row>
              <Col sm="6" md="9" lg="9">
                &nbsp;
              </Col>
              <Col sm="6" md="3" lg="3">
                <Form.Label className="col-form-label required">Currency</Form.Label>
                <Form.Control type="text" name="currency" onChange={(e) => onChangeNumber('currency', e)} value={values.currency} readOnly={isLak} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {cancelText || f({ id: 'common.save' })}
            </Button>
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
        topupBtn={{ label: 'Top up', link: '' }}
        isHideBtnAdd={role?.can_create === 0}
        setIsConfirmModal={setIsConfirmModal}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatusParcel
        hideControlsStatusBill
        isParcel
        hideControlsStatusVerify
        hideControlsStatus
        hidePageControl
        isTopupStatus
        statusOptions={options}
      />
      {/* <Card style={{ borderRight: 'none', padding: '0px' }}> */}
      <Row className="mt-3">
        <Col xs="5" md="5" lg="5" className="text-center">
          &nbsp;
        </Col>
        <Col xs="2" md="1" lg="1" className="text-center">
          <strong>{f({ id: 'common.total' })}</strong>
        </Col>
        <Col xs="2" md="1" lg="1" className="text-start">
          <strong>{total?.weight || ''}</strong>
        </Col>
        <Col xs="2" md="1" lg="1" className="text-start">
          <strong>{total?.cost_price || ''}</strong>
        </Col>
        {/* <Col xs="2" md="1" lg="1" className="text-start">
          <strong>{total?.balance || ''}</strong>
        </Col> */}
      </Row>
      {/* </Card> */}

      <ConfirmModal
        show={isConfirmModal}
        titleText={f({ id: 'common.print' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default Topup;
