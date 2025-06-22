/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup, Modal } from 'react-bootstrap';
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

const Currency = ({ show, onHide }) => {
  const { push } = useHistory();
  const { formatMessage: f } = useIntl();
  const [haveCurrency, setHaveCurrency] = useState(false);
  const [isLoadingCheckCurrency, setIsLoadingCheckCurrency] = useState(true);
  const [isClickCreate, setIsClickCreate] = useState(false);

  // const validationSchema = Yup.object().shape({
  //   exchange_lak: Yup.string().required('Please provide exchange cny Required'),
  // });

  const formik = useFormik({
    initialValues: initialData,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const handleSave = async () => {
    setIsClickCreate(true);
    const data = {
      date: values?.date,
      exchange_cny: values?.exchange_cny || '',
      exchange_lak: values?.exchange_lak || '',
    };
    if (data?.exchange_lak !== '') {
      await request({ url: `/currency`, method: 'POST', data });
      toast('Ceated currency success');
      setIsClickCreate(false);
      push('/');
    }
  };

  const onChangeDate = (e) => {
    const format = moment(e).format('YYYY-MM-DD HH:mm:ss');
    handleChange({ target: { id: 'date', value: format } });
  };

  const onChangeCurrency = (e) => {
    values.exchange_lak = e.target.value;
    handleChange({ target: { id: 'exchange_lak', value: e.target.value } });
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
    setIsLoadingCheckCurrency(false);
    return res.data.data.data;
  };

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        setIsLoadingCheckCurrency(true);
        const currencyData = await searchCurrency({});
        setHaveCurrency(currencyData.length > 0);
        if (currencyData.length > 0) {
          push('/');
        }
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, []);

  return (
    <>
      {!isLoadingCheckCurrency && (
        <Modal className="modal samll fade" show={show} onHide={onHide} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title className="font-weight-bold">Create Currency</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pb-1">
            <Form>
              <div>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.date' })}</Form.Label>
                    <div className="filled-right border rounded-md">
                      <DatepickerBasic onChange={(e) => onChangeDate(e)} value={values?.date} disabled />
                      <CsLineIcons icon="calendar" />
                    </div>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.rateCny' })}</Form.Label>
                    <Form.Control type="number" name="exchange_cny" onChange={handleChange} value={values?.exchange_cny} readOnly />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm="12" md="12" lg="12">
                    <Form.Label className="col-form-label">{f({ id: 'currency.field.rate' })}</Form.Label>
                    <Form.Control
                      type="number"
                      name="exchange_lak"
                      defaultValue={values?.exchange_lak || ''}
                      maxLength={4}
                      onInput={(e) => {
                        if (e.target.value.length > 4) {
                          e.target.value = e.target.value.slice(0, 4);
                        }
                        if (e.target.value.length < 4) {
                          setIsClickCreate(true);
                        } else {
                          setIsClickCreate(false);
                        }
                      }}
                      onChange={onChangeCurrency}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="mb-2">
                    <div className="page-title-container mb-3">
                      <Row className="text-end">
                        <Col md="12">
                          <Button
                            className="btn-icon"
                            variant="primary"
                            onClick={handleSave}
                            hidden={haveCurrency}
                            disabled={isClickCreate || values?.exchange_lak === ''}
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
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default Currency;
