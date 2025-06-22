/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import Select from 'react-select';
import classNames from 'classnames';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerBasic from 'components/datepicker/DatepickerBasic';
import AutoComplete from './AutoComplete';
import ParcelList from './ParcelList';
import { InputMask } from './InputMask';

const initialData = {
  phone: '',
  date_return: '',
  amount_refund: 0,
  delivery_car_no: '',
  delivery_person: '',
  type: 'income',
  sub_type: { label: 'Return Parcel', value: 'return' },
  description: '',
  amount_return: 0,
  pay_cash: 0,
  pay_transfer: 0,
  pay_alipay: 0,
  pay_wechat: 0,
  weight: '',
  item: [],
  status: 'pending',
};

const callAddMasterPayment = async (data = {}) => {
  const res = await request({ url: `/${data?.type}`, method: 'POST', data });
  return res;
};

const callUpdateMasterPayment = async (data = {}) => {
  const res = await request({ url: `/${data?.type}/${data.id}`, method: 'PATCH', data });
  return res;
};

const getIncome = async (id) => {
  const res = await request({ url: `/income-expenses/${id}`, method: 'GET' });
  return {
    ...initialData,
    ...res.data.data,
  };
};

const InformationForm = ({ id, mode }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();
  const [parcelList, setParcelList] = useState([]);
  const [isLak, setIsLak] = useState(true);
  const [amountLakCurrency, setAmountLakCurrency] = useState({ amount_lak: 0, amount_cny: 0 });
  const [selectType, setSelectType] = useState('return');

  const useSetPaymentData = (id) =>
    useQuery(['edit', id], () => getIncome(id), {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
      retry: 0,
      onSuccess(data) {
        data.sub_type = { label: data.sub_type.charAt(0).toUpperCase() + data.sub_type.slice(1), value: data.sub_type };
        data.searchPhone = data.parcel[0]?.track_no || '';
        data.delivery_car_no = data.parcel[0]?.car_number || '';
        data.delivery_person = data.parcel[0]?.driver_name || '';
        data.date_return = moment(data.parcel[0]?.date_return).format('YYYY-MM-DD HH:mm:ss');
        data.weight = data.parcel[0]?.weight;
        data.amount_refund = data.parcel[0]?.refund_amount_lak;
        if (data.sub_type?.label === 'Other') {
          data.amount_refund = data.amount_lak;
          data.amount_return = data.amount_lak;
        }
        setParcelList(data?.parcel || []);
        if (data.pay_cash === 0 && data.pay_transfer === 0) {
          setIsLak(false);
        }
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

  const { mutate: update, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterPayment(currentData), {
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

  const handleCancelClick = () => {
    push('/income');
  };

  const handleSave = () => {
    const sumPrice = parcelList?.reduce((acc, item) => acc + item.price, 0);

    let data = {};
    if (values?.type === 'income') {
      data = {
        phone: '000',
        date_return: values?.date_return,
        delivery_car_no: values?.delivery_car_no,
        delivery_person: values?.delivery_person,
        sub_type: values?.sub_type?.value || values?.sub_type,
        status: values?.status,
        type: values?.type,
        pay_type: 'cash',
        amount_return: sumPrice,
        item: parcelList.map((item) => item.track_no) || [],
      };
      if (values?.sub_type?.value === 'other') {
        data = {
          amount_return: isLak
            ? Number(values?.pay_cash + values?.pay_transfer)
            : Number(values?.pay_alipay + values?.pay_wechat) * amountLakCurrency.amount_lak,
          sub_type: values?.sub_type?.value?.toLowerCase() || values?.sub_type?.toLowerCase(),
          description: values?.description,
          pay_cash: values?.pay_cash,
          pay_transfer: values?.pay_transfer,
          pay_alipay: values?.pay_alipay,
          pay_wechat: values?.pay_wechat,
          status: values?.status,
          type: values?.type,
        };
      }
      if (values?.sub_type?.value === 'top_up') {
        data = {
          amount_return: isLak
            ? Number(values?.pay_cash + values?.pay_transfer)
            : Number(values?.pay_alipay + values?.pay_wechat) * amountLakCurrency.amount_lak,
          sub_type: values?.sub_type?.value?.toLowerCase() || values?.sub_type?.toLowerCase(),
          description: values?.description,
          pay_cash: values?.pay_cash,
          pay_transfer: values?.pay_transfer,
          pay_alipay: values?.pay_alipay,
          pay_wechat: values?.pay_wechat,
          status: values?.status,
          type: values?.type,
        };
      }
    } else if (values?.type === 'expenses') {
      data = {
        weight: values?.weight,
        amount_refund: Number(values?.amount_refund),
        sub_type: values?.sub_type?.value?.toLowerCase() || values?.sub_type?.toLowerCase(),
        item: parcelList[0]?.track_no || '',
        type: values?.type,
        pay_cash: values?.pay_cash,
        pay_transfer: values?.pay_transfer,
        pay_alipay: values?.pay_alipay,
        pay_wechat: values?.pay_wechat,
        pay_type: 'cash',
        status: values?.status,
      };
      if (values?.sub_type?.value === 'other') {
        data = {
          amount_refund: isLak
            ? Number(values?.pay_cash + values?.pay_transfer)
            : Number(values?.pay_alipay + values?.pay_wechat) * amountLakCurrency.amount_lak,
          sub_type: values?.sub_type?.value?.toLowerCase() || values?.sub_type?.toLowerCase(),
          description: values?.description,
          status: values?.status,
          pay_cash: values?.pay_cash,
          pay_transfer: values?.pay_transfer,
          pay_alipay: values?.pay_alipay,
          pay_wechat: values?.pay_wechat,
          type: values?.type,
        };
      }
    }

    console.log(values);
    console.log(data);

    if (!id) {
      saveBill(data);
    } else {
      update({ ...data, id });
    }
  };

  const handleSelectPhoneNo = async ({ name: value }) => {
    if (value) {
      const state = values?.type === 'income' ? 'ready' : 'success';
      const resp = await request({ url: `/parcel`, params: { filters: `${value && `track_no:eq:${value.track_no},status:eq:${state}`}` } });
      handleChange({ target: { id: 'phone', value: resp?.data?.data[0]?.phone } });

      const calcualte = resp.data.data[0]?.price_bill;
      // const calcualte = resp.data.data[0]?.weight * resp.data.data[0]?.price;
      handleChange({ target: { id: 'weight', value: resp.data.data[0]?.weight } });
      handleChange({ target: { id: 'amount_refund', value: calcualte } });
      if (resp.data.data.length > 0) {
        setParcelList(resp.data.data);
      } else {
        setParcelList([]);
      }
    } else {
      setParcelList([]);
    }
  };

  const searchCurrency = async ({ date, page = 1, per_page = 1, sortBy = {} }) => {
    const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';
    const filter = {
      start_at: moment(date || new Date()).format('YYYY-MM-DD 00:00:00'),
      end_at: moment(date || new Date()).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await request({
      url: '/currency',
      method: 'GET',
      params: { ...filter, per_page, page, sorts },
    });
    return res.data.data.data[0];
  };

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const currencyData = await searchCurrency({ date: new Date() });
        setAmountLakCurrency({ amount_lak: currencyData.amount_lak, amount_cny: currencyData.amount_cny });
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, []);

  const handleOnChangeOption = (e) => {
    handleChange({ target: { id: 'type', value: e.target.id } });
    handleChange({ target: { id: 'searchPhone', value: '' } });
    setParcelList([]);
    if (e.target.id === 'income') {
      handleChange({ target: { id: 'sub_type', value: { label: 'Return Parcel', value: 'return' } } });
      setSelectType('return');
    } else if (e.target.id === 'expenses') {
      setSelectType('refund');
      handleChange({ target: { id: 'sub_type', value: { label: 'Refund', value: 'refund' } } });
    }
  };

  const handleChangeType = (e) => {
    handleChange({ target: { id: 'sub_type', value: e } });

    if (e.value === 'return' || e.value === 'refund') {
      setSelectType(e.value);
    } else {
      setSelectType(undefined);
    }
  };

  const onChangeDate = (e) => {
    const format = moment(e).format('YYYY-MM-DD HH:mm:ss');
    handleChange({ target: { id: 'date_return', value: format } });
  };

  const onChangeNumber = (name, e) => {
    if (/^[0-9]*$/.test(e.target.value)) {
      handleChange({ target: { id: [name], value: Number(e.target.value) } });
    }
  };

  const handleCheck = (type, value) => {
    const check = value ? 'verify' : 'pending';
    handleChange({ target: { id: [type], value: check } });
  };

  const onClickSwitchLak = () => {
    handleChange({ target: { id: 'pay_cash', value: 0 } });
    handleChange({ target: { id: 'pay_transfer', value: 0 } });
    handleChange({ target: { id: 'pay_alipay', value: 0 } });
    handleChange({ target: { id: 'pay_wechat', value: 0 } });
    setIsLak(!isLak);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className="page-title-container mb-0">
          <Row>
            <Col className="mb-0">
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">{f({ id: 'income.title' })}</h1>
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
          <Card className="rounded-sm p-4">
            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'income.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-3">
              <div className="d-flex flex-row justify-content-start align-items-center gap-2">
                <Form.Check
                  type="radio"
                  label="Income"
                  id="income"
                  inline
                  name="inlineRadio"
                  className="d-flex flex-row justify-content-start align-items-center gap-2"
                  onChange={handleOnChangeOption}
                  checked={values?.type === 'income'}
                  disabled={!isEditMode || mode === 'edit'}
                />
                <Form.Check
                  type="radio"
                  label="Expenses"
                  id="expenses"
                  inline
                  name="inlineRadio"
                  className="d-flex flex-row justify-content-start align-items-center gap-2"
                  onChange={handleOnChangeOption}
                  checked={values?.type === 'expenses'}
                  disabled={!isEditMode || mode === 'edit'}
                />
              </div>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'income.field.type' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  isDisabled={!isEditMode || mode === 'edit'}
                  options={
                    values?.type === 'income'
                      ? [
                        { label: 'Return Parcel', value: 'return' },
                        { label: 'Other', value: 'other' },
                        { label: 'Topup', value: 'top_up' },
                      ]
                      : [
                        { label: 'Refund', value: 'refund' },
                        { label: 'Other', value: 'other' },
                      ]
                  }
                  required
                  value={values?.sub_type}
                  onChange={handleChangeType}
                />
                {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
              </Col>
            </Row>
            {(values?.sub_type?.value === 'other' || values?.sub_type?.value === 'top_up') && (
              <Row className="mb-2">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'income.field.other' })}</Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    name="description"
                    onChange={handleChange}
                    value={values.description}
                    isInvalid={errors.description && touched.description}
                    readOnly={!isEditMode}
                  />
                  {errors.description && touched.description && <div className="d-block invalid-feedback">{f({ id: errors.description })}</div>}
                </Col>
              </Row>
            )}
            {(values?.sub_type?.value === 'return' || values?.sub_type?.value === 'refund') && (
              <>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="6">
                    <Form.Label className="col-form-label">{f({ id: 'income.field.track' })}</Form.Label>
                    <AutoComplete
                      isDisable={!isEditMode || mode === 'edit'}
                      selectType={selectType}
                      onChange={(value) => handleSelectPhoneNo({ name: value })}
                      value={values.searchPhone}
                      type={values?.type}
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col sm="12" md="12" lg="12">
                    <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'payment.field.parcel-title' })}</h4>
                  </Col>
                </Row>

                <ParcelList data={parcelList} />
              </>
            )}
            <Row className="mt-3">
              <Col sm="10" md="10" lg="10">
                &nbsp;
              </Col>
              <Col xs="6" sm="4" md="2" lg="2" className="d-flex justify-content-center">
                <Button className="btn-icon w-100" variant="primary" onClick={() => onClickSwitchLak()} disabled={!isEditMode}>
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
            {values?.type === 'income' ? (
              <>
                {values?.sub_type?.value === 'return' && (
                  <>
                    <Row className="mt-3">
                      <Col sm="12" md="12" lg="6">
                        <Form.Label className="col-form-label">{f({ id: 'income.field.returnDate' })}</Form.Label>
                        <div className="filled-right border rounded-md">
                          <DatepickerBasic onChange={(e) => onChangeDate(e)} value={values?.date_return} disabled={!isEditMode} />
                          <CsLineIcons icon="calendar" />
                        </div>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col sm="12" md="12" lg="6">
                        <Form.Label className="col-form-label">{f({ id: 'income.field.shippingCarNo' })}</Form.Label>
                        <Form.Control
                          type="text"
                          name="delivery_car_no"
                          onChange={handleChange}
                          value={values.delivery_car_no}
                          isInvalid={errors.delivery_person && touched.delivery_person}
                          readOnly={!isEditMode}
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm="12" md="12" lg="6">
                        <Form.Label className="col-form-label required">{f({ id: 'income.field.driverName' })}</Form.Label>
                        <Form.Control
                          type="text"
                          name="delivery_person"
                          onChange={handleChange}
                          placeholder={f({ id: 'income.field.driverName' })}
                          value={values.delivery_person}
                          // disabled={values.id}
                          isInvalid={errors.delivery_person && touched.delivery_person}
                          readOnly={!isEditMode}
                        />
                        {errors.delivery_person && touched.delivery_person && (
                          <div className="d-block invalid-feedback">{f({ id: errors.delivery_person })}</div>
                        )}
                      </Col>
                    </Row>
                  </>
                )}
                {(values?.sub_type?.value === 'other' || values?.sub_type?.value === 'top_up') && (
                  <Row className="mb-2">
                    <Col sm="12" md="12" lg="3">
                      <Form.Label className="col-form-label required">Cash</Form.Label>
                      <Form.Control
                        type="text"
                        name="pay_cash"
                        onChange={(e) => onChangeNumber('pay_cash', e)}
                        value={values.pay_cash}
                        readOnly={!isEditMode || !isLak}
                      />
                    </Col>
                    <Col sm="12" md="12" lg="3">
                      <Form.Label className="col-form-label required">Transfer</Form.Label>
                      <Form.Control
                        type="text"
                        name="pay_transfer"
                        onChange={(e) => onChangeNumber('pay_transfer', e)}
                        value={values.pay_transfer}
                        readOnly={!isEditMode || !isLak}
                      />
                    </Col>
                    <Col sm="12" md="12" lg="3">
                      <Form.Label className="col-form-label required">Wechat Pay</Form.Label>
                      <Form.Control
                        type="text"
                        name="pay_alipay"
                        onChange={(e) => onChangeNumber('pay_alipay', e)}
                        value={values.pay_alipay}
                        readOnly={!isEditMode || isLak}
                      />
                    </Col>
                    <Col sm="12" md="12" lg="3">
                      <Form.Label className="col-form-label required">Alipay</Form.Label>
                      <Form.Control
                        type="text"
                        name="pay_wechat"
                        onChange={(e) => onChangeNumber('pay_wechat', e)}
                        value={values.pay_wechat}
                        readOnly={!isEditMode || isLak}
                      />
                    </Col>
                  </Row>
                )}
              </>
            ) : (
              <>
                {values?.sub_type?.value !== 'other' && (
                  <Row className="mt-3">
                    <Col sm="12" md="12" lg="6">
                      <Form.Label className="col-form-label">{f({ id: 'income.field.parcel-weight' })}</Form.Label>
                      <Form.Control
                        type="text"
                        name="weight"
                        onChange={(e) => onChangeNumber('weight', e)}
                        value={values.weight}
                        readOnly={!isEditMode}
                        disabled
                      />
                    </Col>
                  </Row>
                )}
                <Row className="mb-2">
                  <Col sm="12" md="12" lg="3">
                    <Form.Label className="col-form-label required">Cash</Form.Label>
                    <Form.Control
                      type="text"
                      name="pay_cash"
                      onChange={(e) => onChangeNumber('pay_cash', e)}
                      value={values.pay_cash}
                      readOnly={!isEditMode || !isLak}
                    />
                  </Col>
                  <Col sm="12" md="12" lg="3">
                    <Form.Label className="col-form-label required">Transfer</Form.Label>
                    <Form.Control
                      type="text"
                      name="pay_transfer"
                      onChange={(e) => onChangeNumber('pay_transfer', e)}
                      value={values.pay_transfer}
                      readOnly={!isEditMode || !isLak}
                    />
                  </Col>
                  <Col sm="12" md="12" lg="3">
                    <Form.Label className="col-form-label required">Wechat Pay</Form.Label>
                    <Form.Control
                      type="text"
                      name="pay_alipay"
                      onChange={(e) => onChangeNumber('pay_alipay', e)}
                      value={values.pay_alipay}
                      readOnly={!isEditMode || isLak}
                    />
                  </Col>
                  <Col sm="12" md="12" lg="3">
                    <Form.Label className="col-form-label required">Alipay</Form.Label>
                    <Form.Control
                      type="text"
                      name="pay_wechat"
                      onChange={(e) => onChangeNumber('pay_wechat', e)}
                      value={values.pay_wechat}
                      readOnly={!isEditMode || isLak}
                    />
                  </Col>
                </Row>
              </>
            )}
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Check
                  type="switch"
                  label={f({ id: values?.status === 'verify' ? 'common.verify' : 'common.unverify' })}
                  className="mt-2"
                  id="status"
                  name="status"
                  checked={values?.status === 'verify'}
                  onChange={(e) => handleCheck('status', e.target.checked)}
                  isInvalid={errors.status && touched.status}
                  disabled={!isEditMode || mode !== 'edit'}
                />
              </Col>
            </Row>
          </Card>
        </Card>
        <div className="page-title-container">
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row className="text-end">
                  <Col md="12">
                    <Button className="btn-icon" variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      {f({ id: 'common.back' })}
                    </Button>{' '}
                    <Button className="btn-icon" variant="primary" type="submit" onClick={handleSave} hidden={mode === 'view'} disabled={isAdding || isSaving || (values?.status === 'verify' && !values.pay_cash && !values.pay_transfer && !values.pay_alipay && !values.pay_wechat)}>
                      {f({ id: 'common.save' })}
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