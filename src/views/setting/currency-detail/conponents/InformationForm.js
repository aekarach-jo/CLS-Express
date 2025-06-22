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
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerBasic from 'components/datepicker/DatepickerBasic';
import { request } from 'utils/axios-utils';
import moment from 'moment';

const initialData = {
  date: moment().format('YYYY-MM-DD HH:mm:ss'),
  exchange_cny: 1,
  exchange_lak: '',
};

const validationSchema = Yup.object().shape({
  exchange_cny: Yup.string().required('Please provide exchange cny Required'),
});

const callAddMasterCurrency = async (data = {}) => {
  const res = await request({ url: `/currency`, method: 'POST', data });
  return res;
};

const callUpdateMasterCurrency = async (data = {}) => {
  console.log(data);

  const res = await request({ url: `/currency/${data.id}`, method: 'PATCH', data });
  return res;
};

const getCurrency = async (id) => {
  const res = await request({ url: `/currency/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useCurrencyData = (id) =>
  useQuery(['editCurrencyData', id], () => getCurrency(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess(data) {
      data.data.date = moment(data.data.date).format('YYYY-MM-DD HH:mm:ss');
      data.data.exchange_cny = data.data.amount_cny;
      data.data.exchange_lak = data.data.amount_lak;
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, mode }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();
  const [haveCurrency, setHaveCurrency] = useState(false);
  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'currency');

  const { data: initResult, isFetching, refetch } = useCurrencyData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveCurrency, isLoading: isAdding } = useMutation((currentData) => callAddMasterCurrency(currentData), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
      }
      const currencyStatus = JSON.parse(localStorage.getItem('token')) || '';
      currencyStatus.setting_currency = true;
      localStorage.setItem('token', JSON.stringify(currencyStatus));

      push('./');
      toast('success');
    },
    onError(error) {
      if (error.response) {
        toast.error(() => {
          return (
            <div style={{ width: 'auto' }}>
              {error?.response?.data?.errors?.map((item, index) => (
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

  const { mutate: updateCurrency, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterCurrency(currentData), {
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
    push('/setting/currency');
  };

  const handleSave = () => {
    var data = {
      date: values?.date,
      exchange_cny: values?.exchange_cny || '',
      exchange_lak: values?.exchange_lak || '',
    };
    if (Object.keys(errors).length === 0) {
      if (!id) {
        saveCurrency(data);
      } else {
        updateCurrency(data, values?.id);
      }
    }
  };

  const onChangeDate = (e) => {
    const format = moment(e).format('YYYY-MM-DD HH:mm:ss');
    handleChange({ target: { id: 'date', value: format } });
  };

  const searchCurrency = async ({ page = 1, per_page = 1, sortBy = {} }) => {
    const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';
    const filter = {
      start_at: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
      end_at: moment(new Date()).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await request({
      url: '/currency',
      method: 'GET',
      params: { ...filter, per_page, page, sorts },
    });
    return res.data.data.data;
  };

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const currencyData = await searchCurrency({});
        setHaveCurrency(currencyData.length > 0);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, []);

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className="page-title-container mb-0">
          <Row>
            <Col className="mb-0">
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">{f({ id: 'currency.field.create' })}</h1>
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
          <Card className="rounded-sm p-4" style={{ minHeight: '65vh' }}>
            <Row className="mt-3 mb-5">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'currency.field.info' })}</h4>
              </Col>
            </Row>
            {mode === 'new' ? (
              <>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="6">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.date' })}</Form.Label>
                    <div className="filled-right border rounded-md">
                      <DatepickerBasic onChange={(e) => onChangeDate(e)} value={values?.date} disabled />
                      <CsLineIcons icon="calendar" />
                    </div>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="6">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.rateCny' })}</Form.Label>
                    <Form.Control type="number" name="exchange_cny" onChange={handleChange} value={values?.exchange_cny} readOnly />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="6">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.rate' })}</Form.Label>
                    <Form.Control
                      type="number"
                      name="exchange_lak"
                      onChange={handleChange}
                      value={values?.exchange_lak}
                      readOnly={!isEditMode || haveCurrency}
                    />
                  </Col>
                </Row>
              </>
            ) : (
              <Row className="mb-3">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'currency.field.date' })}</Form.Label>
                  <div className="filled-right border rounded-md">
                    <DatepickerBasic onChange={(e) => onChangeDate(e)} value={values?.date} />
                    <CsLineIcons icon="calendar" />
                  </div>
                </Col>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'currency.field.rate' })}</Form.Label>
                  <Form.Control type="number" name="exchange_lak" onChange={handleChange} value={values?.exchange_lak} readOnly={!isEditMode || haveCurrency} />
                </Col>
              </Row>
            )}
          </Card>
        </Card>
        <hr />
        <div className="page-title-container">
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row className="text-end">
                  <Col md="12">
                    <Button className="btn-icon" border variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      {f({ id: 'common.back' })}
                    </Button>{' '}
                    <Button
                      className="btn-icon"
                      variant="primary"
                      type="submit"
                      onClick={handleSave}
                      hidden={mode === 'view' || haveCurrency || role?.can_create === 0}
                    >
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
