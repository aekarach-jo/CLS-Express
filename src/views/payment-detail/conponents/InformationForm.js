/* eslint-disable no-restricted-globals */
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
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useIsMobile } from 'hooks/useIsMobile';
import classNames from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';
import { request } from 'utils/axios-utils';
import deb from 'lodash';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import AutoComplete from './AutoComplete';
import BillList from './BillList';

const initialData = {
  name: '',
  phone: '',
  address: '',
  remark: '',
  cash: 0,
  transfer: 0,
  amount: 0,
  payment_type: [],
  bill: [],
};

const callAddMasterPayment = async (data = {}) => {
  const res = await request({ url: `/payment`, method: 'POST', data });
  return res;
};

const callUpdateMasterPayment = async (data = {}) => {
  const res = await request({ url: `/payment/${data.id}`, method: 'PATCH', data });
  return res;
};

const getPayment = async (id) => {
  const res = await request({ url: `/payment/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const InformationForm = ({ id, mode }) => {
  const { formatMessage: f } = useIntl();
  const [isEditMode, setIsEditMode] = useState(mode === 'new' || (mode === 'edit' && id));
  const [isPaid, setIsPaid] = useState(false);
  const { push } = useHistory();
  const [billList, setBillList] = useState([]);
  const [paymentType, setPaymentType] = useState('cash');
  const [isLak, setIsLak] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCheckHasChange, setIsCheckHasChange] = useState();
  const [amountLakCurrency, setAmountLakCurrency] = useState({ amount_lak: 0, amount_cny: 0 });
  const [checkAll, setCheckAll] = useState([]);
  const [trackNo, setTrackNo] = useState('');
  const focusInputRef = useRef(null);
  const isMobile = useIsMobile();
  const scanRef = useRef(false);

  const handleFocusInput = () => {
    if (focusInputRef.current) {
      focusInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      focusInputRef.current.focus();
    }
  };

  const useSetPaymentData = (id) =>
    useQuery(['editCustomerData', id], () => getPayment(id), {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
      retry: 0,
      onSuccess(data) {
        data?.data.bill_payment.forEach((item) => {
          item.checked = true;
          item.parcels.forEach((parcel) => {
            parcel.checked = parcel.is_check;
          });
        });

        setCheckAll(data?.data.bill_payment || []);
        setBillList(data?.data.bill_payment || []);
        data.name = data?.data.bill_payment[0]?.name;
        data.phone = data?.data.bill_payment[0]?.phone;
        data.address = data?.data.bill_payment[0]?.address;
        data.remark = data?.data.bill_payment[0]?.remark;
        data.searchPhone = data?.data.bill_payment[0]?.phone;
        const filteredPayments = data?.data?.payments?.filter((item) => item.method !== null);
        data.data.payments = filteredPayments;
        data?.data?.payments.forEach((item) => {
          if (item.method === 'cash') {
            data.cash = item.amount_lak;
            setPaymentType('cash');
          }
          if (item.method === 'transffer') {
            data.transfer = item.amount_lak;
          }
          if (item.method === 'wechat_pay' || item.method === 'alipay') {
            setIsLak(false);
            setPaymentType(item.method);
            data.amount = item.amount_cny;
          }
          if (item.status === 'pending') {
            setIsEditMode(true);
          }
          if (item.status === 'paid') {
            setIsEditMode(false);
            setIsPaid(true);
          }
        });
      },
      onError(err) {
        console.error('Error:', err);
      },
    });

  const { data: initResult, isFetching, refetch } = useSetPaymentData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveBill, isLoading: isAdding } = useMutation((currentData) => callAddMasterPayment(currentData), {
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

  const { mutate: updateBill, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterPayment(currentData), {
    async onSuccess(res) {
      const filterParcel = billList.map((item) => {
        return {
          ...item,
          parcels: item.parcels.filter((parcel) => parcel.checked),
        };
      });
      const flatParcel = filterParcel.map((item) => item.parcels).flat();
      const getParcelTrackNoList = flatParcel.map((item) => item.track_no);
      try {
        await request({ url: `/parcel-check`, method: 'POST', data: { is_check: getParcelTrackNoList } });
        refetch();
      } catch (error) {
        console.log('Error:', error);
      }
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
    push('/payment');
  };

  const handleSave = ({ status }) => {
    const getFilterChecked = id ? billList.filter((item) => item.checked === true) : checkAll.filter((item) => item.checked === true);
    const sumAmount = getFilterChecked.reduce((acc, item) => (item.checked ? acc + item.amount_lak : acc), 0);

    var data = {
      id: values?.id,
      active: true,
      bill: getFilterChecked.map((item) => item.bill_no),
      draft: status === 'pending' ? true : false,
      payment_type: [],
    };

    if (data.payment_type.length === 0) {
      data.payment_type.push({
        name: null,
        amount_cny: 0,
        amount_lak: 0,
        currency: 'lak',
      });
    }

    if (paymentType === 'cash') {
      if (values?.cash) {
        data.payment_type = [
          ...data.payment_type,
          {
            name: 'cash',
            amount_lak: Number(values?.cash),
            amount_cny:
              amountLakCurrency.amount_cny && amountLakCurrency.amount_lak
                ? Math.ceil((values?.cash / (amountLakCurrency.amount_cny * amountLakCurrency.amount_lak)) * 100) / 100
                : 0,
            currency: 'lak',
          },
        ];
      }
      if (values?.transfer) {
        data.payment_type = [
          ...data.payment_type,
          {
            name: 'transffer',
            amount_lak: Number(values?.transfer),
            amount_cny:
              amountLakCurrency.amount_cny && amountLakCurrency.amount_lak
                ? Math.ceil((values?.transfer / (amountLakCurrency.amount_cny * amountLakCurrency.amount_lak)) * 100) / 100
                : 0,
            currency: 'lak',
          },
        ];
      }
    }
    if (paymentType === 'alipay') {
      if (values?.amount) {
        data.payment_type = [
          ...data.payment_type,
          {
            name: 'alipay',
            amount_lak: sumAmount,
            amount_cny: Number(values?.amount),
            currency: 'cny',
          },
        ];
      }
    }
    if (paymentType === 'wechat_pay') {
      if (values?.amount) {
        data.payment_type = [
          ...data.payment_type,
          {
            name: 'wechat_pay',
            amount_lak: sumAmount,
            amount_cny: Number(values?.amount),
            currency: 'cny',
          },
        ];
      }
    }

    const filteredPayments = data?.payment_type?.filter((item) => item.name !== null);

    data.payment_type = filteredPayments;
    if (!id) {
      saveBill(data);
    } else {
      updateBill({ ...data, id });
    }
  };

  const handleSelectPhoneNo = async ({ name: value }) => {
    if (value) {
      const resp = await request({ url: `/bill`, params: { filters: `${value && `phone:eq:${value},`}status:eq:shipped` } });
      const respData = resp.data.data.filter((item) => !item.payment_no);
      if (respData && respData.length === 0) {
        toast.error('Bill has been waiting for payment');
      } else if (resp.data.data.length > 0) {
        handleChange({ target: { id: 'name', value: resp.data.data[0].name } });
        handleChange({ target: { id: 'phone', value: resp.data.data[0].phone } });
        handleChange({ target: { id: 'address', value: resp.data.data[0].address } });
        const addStatusChecked = resp.data.data.map((item) => {
          return { ...item, parcels: item.parcels.map((parcel) => ({ ...parcel, checked: false })) };
        });
        setBillList(resp.data.data);
      } else {
        handleChange({ target: { id: 'name', value: '' } });
        handleChange({ target: { id: 'phone', value: '' } });
        handleChange({ target: { id: 'address', value: '' } });
        setBillList([]);
      }
    } else {
      setBillList([]);
    }
  };

  const handleSelectPaymentType = (value) => {
    setPaymentType(value);

    handleChange({ target: { id: 'cash', value: '' } });
    handleChange({ target: { id: 'transfer', value: '' } });
    handleChange({ target: { id: 'amount', value: '' } });
  };

  const handleChangeAmount = (name, value) => {
    value = Number(value);
    if (isNaN(value)) {
      value = 0;
    }

    if (value === 0) {
      handleChange({ target: { id: [name], value: 0 } });
    }

    if (Number.isInteger(value)) {
      if (name === 'cash') {
        if (value > totalAmount) {
          handleChange({ target: { id: 'cash', value: totalAmount } });
          handleChange({ target: { id: 'transfer', value: '' } });
        } else {
          handleChange({ target: { id: 'cash', value } });
          handleChange({ target: { id: 'transfer', value: totalAmount - value } });
        }
      } else if (name === 'transfer') {
        if (value > totalAmount) {
          handleChange({ target: { id: 'transfer', value: totalAmount } });
          handleChange({ target: { id: 'cash', value: '' } });
        } else {
          handleChange({ target: { id: 'transfer', value } });
          handleChange({ target: { id: 'cash', value: totalAmount - value } });
        }
      } else if (name === 'amount' && value > totalAmount) {
        handleChange({ target: { id: 'amount', value: totalAmount } });
      } else {
        handleChange({ target: { id: 'amount', value } });
      }
    }
  };

  useEffect(() => {
    if (!isFetching && !id) {
      if (values?.data?.payments[0]?.method === 'cash') {
        setPaymentType('cash');
      }
      if (values?.data?.payments[0]?.method === 'alipay') {
        setIsLak(false);
        setPaymentType('alipay');
      }
      if (values?.data?.payments[0]?.method === 'wechat_pay') {
        setIsLak(false);
        setPaymentType('wechat_pay');
      }
    }
  }, [values]);

  useEffect(() => {
    if (values?.data?.payments[0]?.status !== 'paid') {
      handleChange({ target: { name: 'transfer', value: values?.transfer } });
      handleChange({ target: { name: 'cash', value: values?.cash } });
    }
    if (paymentType === 'cash' && !isLak) {
      setPaymentType('alipay');
    } else if (isLak) {
      setPaymentType('cash');
    }
  }, [isLak]);

  useEffect(() => {
    handleChange({ target: { id: 'cash', value: totalAmount } });
    // if (isCheckHasChange) {
    // }else{
    //   handleChange({ target: { id: 'cash', value: 0 } });
    // }
  }, [isCheckHasChange]);

  const handleChangeTrackNo = deb.debounce((e) => {
    handleChange({ target: { id: 'cash', value: '' } });
    handleChange({ target: { id: 'transfer', value: '' } });
    handleChange({ target: { id: 'amount', value: '' } });
    if (scanRef.current) return;
    scanRef.current = true;
    setIsCheckHasChange(!isCheckHasChange);
    setBillList((prev) => {
      // Check if track number exists in any parcel first
      const trackExists = prev.some((item) =>
        item.parcels.some((parcel) => parcel.track_no === e.target.value)
      );

      // Show toast only once based on whether track number was found
      if (trackExists) {
        toast(
          <div>
            Check <strong style={{ color: 'black' }}>[{e.target.value}]</strong> success
          </div>,
          {
            position: isMobile && toast.POSITION.BOTTOM_RIGHT,
            style: { marginBottom: isMobile ? '3rem' : '0rem' },
          }
        );
      } else {
        toast.error(`Track Number [${e.target.value}] not found!`, {
          position: isMobile && toast.POSITION.BOTTOM_RIGHT,
          style: { marginBottom: isMobile ? '3rem' : '0rem' },
        });
      }

      // Update the bill list
      const updatedList = prev.map((item) => {
        const updatedParcels = item.parcels.map((parcel) => {
          if (parcel.track_no === e.target.value) {
            return {
              ...parcel,
              checked: true,
            };
          }
          return parcel;
        });

        return {
          ...item,
          parcels: updatedParcels,
          checkedAll: updatedParcels.every((parcel) => parcel.checked),
        };
      });

      setTimeout(() => {
        setTrackNo('');
        scanRef.current = false;
      }, 1000);

      return updatedList;
    });
    // setCheckAll((prev) => {
    //   return prev.map((item) => {
    //     console.log(item);
    //     const parcelFound = item.parcels.some((parcel) => parcel.track_no === e.target.value);
    //     if (parcelFound) {
    //       item.parcels = item.parcels.map((parcel) => {
    //         if (parcel.track_no === e.target.value) {
    //           return {
    //             ...parcel,
    //             checked: true,
    //           };
    //         }
    //         return parcel;
    //       });
    //     } else {
    //       toast.error(`Track Number [${e.target.value}] not found!`, {
    //         position: isMobile && toast.POSITION.BOTTOM_RIGHT,
    //         style: { marginBottom: isMobile ? '3rem' : '0rem' },
    //       });
    //     }
    //     setTimeout(() => {
    //       setTrackNo('');
    //       scanRef.current = false;
    //       return false;
    //     }, 1000);
    //     clearTimeout();

    //     return {
    //       ...item,
    //       checkedAll: item.parcels.every((parcel) => parcel.checked),
    //     };
    //   });
    // });
  }, 400);

  useEffect(() => {
    setBillList((prev) => {
      return prev.map((item) => {
        setTimeout(() => {
          setTrackNo('');
        }, 400);
        clearTimeout();
        return {
          ...item,
          checkedAll: item.parcels.every((parcel) => parcel.checked),
        };
      });
    });
  }, [trackNo]);

  useEffect(() => {
    if (id) {
      setIsEditMode(billList.length > 0 && billList.every((item) => item.parcels.every((parcel) => parcel.checked)));
    } else {
      setIsEditMode(billList.every((item) => item.checkedAll));
    }
  }, [billList]);

  const isSelectBillItem = billList.filter((item) => item.checked);

  return (
    <>
      <Form>
        <div className="page-title-container mb-0">
          <Row>
            <Col className="mb-0">
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">{f({ id: 'payment.title' })}</h1>
                </Col>
              </div>
            </Col>
          </Row>
        </div>
        <div
          className={classNames('mb-5', {
            'overlay-spinner': isFetching,
          })}
        >
          {billList.length > 0 && (
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
                    focusInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <CsLineIcons icon="maximize" className="btn-icon-only" />
              </Button>
            </div>
          )}
          <div className={`rounded-sm ${isMobile ? 'p-0' : ' p-4'}`}>
            {mode !== 'view' && (
              <Row className="mb-3">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'payment.field.search' })}</Form.Label>
                  <AutoComplete isDisable={!isEditMode} onChange={(value) => handleSelectPhoneNo({ name: value })} value={values.searchPhone} />
                </Col>
              </Row>
            )}
            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'payment.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'payment.field.name' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  style={{ fontSize: '1rem' }}
                  onChange={handleChange}
                  value={values?.name}
                  // disabled={values?.id}
                  isInvalid={errors.name && touched.name}
                  readOnly
                />
                {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'payment.field.phone' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  style={{ fontSize: '1rem' }}
                  onChange={handleChange}
                  value={values?.phone}
                  // disabled={values?.id}
                  isInvalid={errors.phone && touched.phone}
                  readOnly
                />
                {errors.phone && touched.phone && <div className="d-block invalid-feedback">{f({ id: errors.phone })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'payment.field.address' })}</Form.Label>
                <Form.Control
                  as="textarea"
                  type="text"
                  name="address"
                  style={{ fontSize: '1rem' }}
                  onChange={handleChange}
                  value={values?.address}
                  isInvalid={errors.address && touched.address}
                  readOnly
                />
                {errors.address && touched.address && <div className="d-block invalid-feedback">{f({ id: errors.address })}</div>}
              </Col>
            </Row>
            <Row className="mt-3" ref={focusInputRef}>
              <Col sm="10" md="10" lg="10">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'payment.field.pill-pay' })}</h4>
              </Col>
              <Col xs="6" sm="4" md="2" lg="2" className="d-flex justify-content-center">
                <Button className="btn-icon w-100" variant="primary" onClick={() => setIsLak(!isLak)} disabled={!isEditMode || isPaid}>
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
            {billList.length > 0 && (
              <Row className="justify-content-start">
                <Col xs="12" md="6" className="text-center my-2">
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
                <Col xs="12" md="6" className="text-center my-2">
                  <InputGroup>
                    <Form.Control disabled value="Remark" className="font-weight-bold" />
                    <Form.Control
                      className="w-50"
                      type="text"
                      name="remark"
                      onChange={handleChange}
                      value={values?.remark || ''}
                      readOnly={values?.data?.payments[0]?.status === 'paid'}
                    />
                  </InputGroup>
                </Col>
              </Row>
            )}
            {billList.length > 0 ? (
              <BillList
                data={billList}
                setData={setBillList}
                checkAll={checkAll}
                setCheckAll={setCheckAll}
                isLak={isLak}
                setIsLak={setIsLak}
                isEditMode={isEditMode}
                setAmountLakCurrency={setAmountLakCurrency}
                setTotalAmount={setTotalAmount}
                setIsCheckHasChange={setIsCheckHasChange}
                isCheckHasChange={isCheckHasChange}
              />
            ) : (
              <div className="text-center">No Data</div>
            )}
            <Row className="mt-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'payment.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="my-4">
              <div className="d-flex flex-row justify-content-start align-items-center gap-2">
                <Form.Check
                  type="radio"
                  label="Cash / Transfer"
                  checked={paymentType === 'cash'}
                  id="inlineRadio1"
                  inline
                  name="inlineRadio"
                  className="d-flex flex-row justify-content-start align-items-center gap-2"
                  onChange={() => handleSelectPaymentType('cash')}
                  disabled={!isEditMode || !isLak}
                />
                <Form.Check
                  type="radio"
                  label="Alipay"
                  checked={paymentType === 'alipay'}
                  id="inlineRadio2"
                  inline
                  name="inlineRadio"
                  className="d-flex flex-row justify-content-start align-items-center gap-2"
                  onChange={() => handleSelectPaymentType('alipay')}
                  disabled={!isEditMode || isLak}
                />
                <Form.Check
                  type="radio"
                  label="Wechat Pay"
                  checked={paymentType === 'wechat_pay'}
                  id="inlineRadio3"
                  inline
                  name="inlineRadio"
                  className="d-flex flex-row justify-content-start align-items-center gap-2"
                  onChange={() => handleSelectPaymentType('wechat_pay')}
                  disabled={!isEditMode || isLak}
                />
              </div>
            </Row>
            {paymentType !== 'cash' ? (
              <Row className="mb-2">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'payment.field.payment-info-amount' })}</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    // min="0"
                    onChange={(e) => handleChangeAmount('amount', e.target.value)}
                    value={values?.amount || 0}
                    readOnly={isSelectBillItem.length === 0 || !isEditMode || isLak}
                  />
                </Col>
              </Row>
            ) : (
              <Row className="mb-2">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'payment.field.cash-amount' })}</Form.Label>
                  <Form.Control
                    type="number"
                    name="cash"
                    // min="0"
                    onChange={(e) => handleChangeAmount('cash', e.target.value)}
                    value={values?.cash || 0}
                    readOnly={isSelectBillItem.length === 0 || !isEditMode || !isLak || billList.length === 0 || isPaid}
                  />
                  {errors.cash && touched.cash && <div className="d-block invalid-feedback">{f({ id: errors.cash })}</div>}
                </Col>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'payment.field.transfer-amount' })}</Form.Label>
                  <Form.Control
                    type="number"
                    name="transfer"
                    // min="0"
                    onChange={(e) => handleChangeAmount('transfer', e.target.value)}
                    value={values?.transfer || 0}
                    readOnly={isSelectBillItem.length === 0 || !isEditMode || !isLak || isPaid}
                    isInvalid={errors.transfer && touched.transfer}
                  />
                  {errors.transfer && touched.transfer && <div className="d-block invalid-feedback">{f({ id: errors.transfer })}</div>}
                </Col>
              </Row>
            )}
          </div>
        </div>
        <div className="page-title-container">
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row className="text-end">
                  <Col md="12">
                    <Button className="btn-icon" variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      {f({ id: 'common.back' })}
                    </Button>{' '}
                    <Button
                      className="btn-icon text-white"
                      variant="warning"
                      hidden={mode === 'view' || isPaid}
                      onClick={() => handleSave({ status: 'pending' })}
                      disabled={billList.length === 0 || isAdding || isSaving}
                    >
                      {f({ id: 'common.save' })}
                    </Button>{' '}
                    <Button
                      className="btn-icon"
                      variant="primary"
                      hidden={mode === 'view' || isPaid}
                      onClick={() => handleSave({ status: 'paid' })}
                      disabled={billList.length === 0 || isAdding || isSaving || !isEditMode}
                    >
                      {f({ id: 'common.submit' })}
                    </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </Form>
    </>
  );
};

export default InformationForm;
