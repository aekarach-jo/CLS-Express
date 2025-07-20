/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import { useIsMobile } from 'hooks/useIsMobile';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import deb from 'lodash';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import AutoComplete from './AutoComplete';
import ParcelList from './ParcelList';
import LovCustomerSelect from './LovSelectCustomer';
import Customer from './Customer';

const initialData = {
  name: '',
  phone: '',
  address: '',
  statusCheck: false,
  item: [],
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please provide Name Required'),
  phone: Yup.string().required('Please provide Phone Required'),
  address: Yup.string().required('Please provide Address Required'),
});

const callAddMasterBill = async (data = {}) => {
  const res = await request({ url: `/bill`, method: 'POST', data });
  return res;
};

const callUpdateMasterBill = async (data = {}) => {
  const res = await request({ url: `/bill/${data.id}`, method: 'PATCH', data });
  return res;
};

const getBill = async (id) => {
  const res = await request({ url: `/bill/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const InformationForm = ({ id, mode, customerLevelOption }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();
  const [parcelList, setParcelList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCheckHasChange, setIsCheckHasChange] = useState();
  const [amountLakCurrency, setAmountLakCurrency] = useState({ amount_lak: 0, amount_cny: 0 });
  const [checkAll, setCheckAll] = useState([]);
  const [getRate, setGetRate] = useState();
  const [trackNo, setTrackNo] = useState('');
  const [isOpenAddCustomerModal, setIsOpenAddCustomerModal] = useState(false);
  const [isDataFromCustomer, setIsDataFromCustomer] = useState(false);
  const focusInputRef = useRef(null);
  const isMobile = useIsMobile();
  const scanRef = useRef(false);

  const handleFocusInput = () => {
    if (focusInputRef.current) {
      focusInputRef.current.scrollIntoView({ behavior: 'smooth' });
      focusInputRef.current.focus();
    }
  };

  const useSetBillData = (id) =>
    useQuery(['editCustomerData', id], () => getBill(id), {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
      retry: 0,
      onSuccess({ data }) {
        data?.item.forEach((item) => {
          item.checked = true;
        });
        setParcelList(data?.item || []);
      },
      onError(err) {
        console.error('Error:', err);
      },
    });

  const { data: initResult, isFetching, refetch } = useSetBillData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleChange, values, touched, errors } = formik;

  const { mutate: saveBill, isLoading: isAdding } = useMutation((currentData) => callAddMasterBill(currentData), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
      }
      push('./');
      toast('success');
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

  const { mutate: updateBill, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterBill(currentData), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
      }
      refetch();
      toast('success');
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

  const handleCancelClick = () => {
    push('/bill');
  };

  const handleSave = () => {
    const getFilterChecked = checkAll.filter((item) => item.checked === true);
    const getParcelChecked = parcelList.filter((item) => item.checked === true);

    var data = {
      id: values?.id,
      name: values?.name || '',
      phone: values?.phone || '',
      address: values?.address || '',
      item: getParcelChecked.length !== 0 ? getParcelChecked.map((item) => item.track_no) : getFilterChecked.map((item) => item.track_no),
    };

    console.log(Object.keys(errors).length === 0);

    if (data) {
      if (!id) {
        saveBill(data);
      } else {
        updateBill(data, values?.id);
      }
    }
  };

  const handleSelectPhoneNo = async (value) => {
    if (value) {
      handleChange({ target: { id: 'address', value: value.address } });
      handleChange({ target: { id: 'name', value: value.name } });
      handleChange({ target: { id: 'phone', value: value.phone } });
      setGetRate(value?.level_rate);

      const resp = await request({ url: `/parcel`, params: { filters: `${value.phone && `phone:eq:${value.phone},`}status:eq:pending` } });
      if (resp.data.data.length > 0) {
        setParcelList(resp.data.data);
        // handleChange({ target: { id: 'name', value: resp.data.data[0].name } });
        // handleChange({ target: { id: 'phone', value: resp.data.data[0].phone } });
      } else {
        handleChange({ target: { id: 'name', value: '' } });
        handleChange({ target: { id: 'phone', value: '' } });
        setParcelList([]);
      }
    } else {
      setParcelList([]);
      handleChange({ target: { id: 'name', value: '' } });
      handleChange({ target: { id: 'phone', value: '' } });
      handleChange({ target: { id: 'address', value: '' } });
    }
  };

  const handleChecngePhoneNo = async (value) => {
    parcelList.forEach((item) => {
      item.customer_level = value?.detail?.customer_level;
    })

    if (value.value === 'newCustomer') {
      setIsOpenAddCustomerModal(true);
      handleChange({ target: { id: 'name', value: '' } });
      handleChange({ target: { id: 'address', value: '' } });
      return;
    }
    if (value) {
      handleChange({ target: { id: 'phone', value: value.label } });
      handleChange({ target: { id: 'name', value: value?.detail?.name } });
      handleChange({ target: { id: 'address', value: value?.detail?.address } });
    }
  };
  const handleCheck = async (type, value) => {
    handleChange({ target: { id: 'name', value: '' } });
    handleChange({ target: { id: 'phone', value: '' } });
    handleChange({ target: { id: 'address', value: '' } });
    handleChange({ target: { id: [type], value } });
    if (value) {
      handleChange({ target: { id: 'searchPhone', value: '' } });
      const resp = await request({ url: `/parcel`, params: { filters: `${value && `phone:eq:0,`}status:eq:pending` } });
      if (resp.data.data.length > 0) {
        // handleChange({ target: { id: 'name', value: resp.data.data[0].name } });
        // handleChange({ target: { id: 'address', value: resp.data.data[0].address } });
        setParcelList(resp.data.data);
      } else {
        setParcelList([]);
      }
    } else {
      setParcelList([]);
    }
  };

  const handleChangeTrackNo = deb.debounce((e) => {
    if (scanRef.current) return;
    scanRef.current = true;

    setParcelList((prev) => {
      const parcelFound = prev.some((parcel) => parcel.track_no === e.target.value);
      if (!parcelFound) {
        toast.error(`Track Number [${e.target.value}] not found!`, {
          position: isMobile && toast.POSITION.BOTTOM_RIGHT,
          style: { marginBottom: isMobile ? '3rem' : '0rem' },
        });
        setTimeout(() => {
          setTrackNo('');
          scanRef.current = false;
          return false;
        }, 500);
        clearTimeout();
      }

      return prev.map((item) => {
        if (item.track_no === e.target.value) {
          toast(
            <div>
              Check <strong style={{ color: 'black' }}>[{e.target.value}]</strong> success
            </div>,
            {
              position: isMobile && toast.POSITION.BOTTOM_RIGHT,
              style: { marginBottom: isMobile ? '3rem' : '0rem' },
            }
          );
          item.checked = true;
        }
        setTimeout(() => {
          setTrackNo('');
          scanRef.current = false;
          return false;
        }, 500);
        clearTimeout();

        return {
          ...item,
        };
      });
    });
  }, 400);

  const handleChangeDataFromCustomer = (value) => {
    console.log(value);
    setIsDataFromCustomer(true);
    setIsOpenAddCustomerModal(false);
    handleChange({ target: { id: 'phone', value: value?.phone } });
    handleChange({ target: { id: 'name', value: value?.name } });
    handleChange({ target: { id: 'address', value: value?.address } });
  };

  return (
    <>
      <Form>
        <div className="page-title-container mb-0">
          <Row>
            <Col>
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">{f({ id: 'bill.field.create' })}</h1>
                </Col>
              </div>
            </Col>
          </Row>
        </div>
        <Card
          className={classNames('mb-5', {
            'overlay-spinner': isFetching,
          })}
        >
          {parcelList?.length > 0 && (
            <div className="d-block d-md-none position-fixed bottom-0 end-0 p-3 z-index-1">
              <Button
                className="floating-button btn-icon-only btn-primary rounded-pill"
                variant="primary"
                size="lg"
                onClick={() => {
                  handleFocusInput();
                  const trackNoInput = document.querySelector('input[name="trackNoScaning"]');
                  if (trackNoInput) {
                    trackNoInput.focus();
                  }
                }}
              >
                <CsLineIcons icon="maximize" className="btn-icon-only" />
              </Button>
            </div>
          )}
          <Card className="rounded-sm p-4">
            <Row className="">
              <Col sm="12" md="12" lg="6">
                <Form.Check
                  type="switch"
                  label={f({ id: values?.statusCheck ? 'common.phone.active' : 'common.phone.inactive' })}
                  className="mt-2 text-color-red"
                  id="active"
                  name="active"
                  disabled={!isEditMode || isDataFromCustomer}
                  checked={values?.statusCheck}
                  onChange={(e) => handleCheck('statusCheck', e.target.checked)}
                />
              </Col>
            </Row>
            {isEditMode && !values?.statusCheck && (
              <Row className="mb-3">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'bill.field.search' })}</Form.Label>
                  <AutoComplete isDisable={!isEditMode || values?.statusCheck} onChange={(value) => handleSelectPhoneNo(value)} value={values.searchPhone} />
                </Col>
              </Row>
            )}

            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'bill.field.info' })}</h4>
              </Col>
            </Row>
            <Row style={{ fontSize: '1.2rem' }}>
              <Col sm="12" md="12" lg="6">
                <Row className="mb-2">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label required text-color-red">{f({ id: 'bill.field.name' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      style={{ fontSize: '1rem' }}
                      onChange={handleChange}
                      value={values?.name}
                      isInvalid={errors.name && touched.name}
                      readOnly={!isEditMode || isDataFromCustomer}
                    />
                    {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label required text-color-red">{f({ id: 'bill.field.phone' })}</Form.Label>
                    {/* <AutoCompleteFilterCusLevel isDisable={!isEditMode || !values?.statusCheck} onChange={(value) => handleChecngePhoneNo(value)} value={values.phone} /> */}
                    {!values?.statusCheck || isDataFromCustomer ? (
                      <Form.Control
                        type="text"
                        name="phone"
                        style={{ fontSize: '1rem' }}
                        onChange={handleChange}
                        value={values?.phone}
                        isInvalid={errors.phone && touched.phone}
                        readOnly={!values?.statusCheck || isDataFromCustomer}
                      />
                    ) : (
                      <LovCustomerSelect isDisabled={!values?.statusCheck || isDataFromCustomer} onChange={handleChecngePhoneNo} />
                    )}
                    {errors.phone && touched.phone && <div className="d-block invalid-feedback">{f({ id: errors.phone })}</div>}
                  </Col>
                </Row>
              </Col>
              <Col sm="12" md="12" lg="6">
                <Row className="mb-2">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label required">{f({ id: 'bill.field.address' })}</Form.Label>
                    <Form.Control
                      type="text"
                      style={{ fontSize: '1rem' }}
                      name="address"
                      onChange={handleChange}
                      value={values?.address || ''}
                      isInvalid={errors.address && touched.address}
                      readOnly={!isEditMode || isDataFromCustomer}
                    />
                    {errors.address && touched.address && <div className="d-block invalid-feedback">{f({ id: errors.address })}</div>}
                  </Col>
                </Row>

                {parcelList.length > 0 && (
                  <>
                    <Row className="mt-1">
                      <Col sm="12" md="12" lg="12">
                        <Form.Label className="col-form-label required">{f({ id: 'bill.field.parcel-title' })}</Form.Label>
                      </Col>
                    </Row>
                    <Row className="justify-content-start">
                      <Col xs="12" md="12" className="text-center">
                        <InputGroup>
                          <Form.Control disabled value="Track No." className="font-weight-bold" />
                          <Form.Control
                            className="w-50"
                            type="text"
                            name="trackNoScaning"
                            onChange={(e) => {
                              handleChangeTrackNo(e);
                              setTrackNo(e.target.value);
                            }}
                            value={trackNo || ''}
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
            </Row>
            <ParcelList
              data={parcelList}
              setData={setParcelList}
              checkAll={checkAll}
              setCheckAll={setCheckAll}
              isEditMode={isEditMode}
              setIsCheckHasChange={setIsCheckHasChange}
              isCheckHasChange={isCheckHasChange}
              setTotalAmount={setTotalAmount}
              rate={getRate}
            />
          </Card>
        </Card>
        <div className="page-title-container">
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row className="text-end">
                  <Col md="12">
                    <Button className="btn-icon" border variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      {f({ id: 'common.back' })}
                    </Button>{' '}
                    <Button className="btn-icon" variant="primary" type="button" onClick={handleSave} hidden={mode === 'view'} disabled={isAdding || isSaving}>
                      {f({ id: 'common.save' })}
                    </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </Form>

      <Customer show={isOpenAddCustomerModal} onHide={() => setIsOpenAddCustomerModal(false)} onGetCustomerData={handleChangeDataFromCustomer} />
    </>
  );
};

export default InformationForm;
