/* eslint-disable no-nested-ternary */
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
import axios from 'axios';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import Select from 'react-select';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import { request } from 'utils/axios-utils';

const initialData = {
  name: '',
  phone: '',
  level_id: '',
  address: '',
  verify: true,
  active: true,
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please provide Name Required'),
  phone: Yup.string().required('Please provide Phone Required'),
  address: Yup.string().required('Please provide Address Required'),
  level_id: Yup.object().required('Please provide Customer level Required'),
});

const callAddMasterCustomer = async (data = {}) => {
  const res = await request({ url: `/customer`, method: 'POST', data });
  return res;
};

const callUpdateMasterCustomer = async (data = {}) => {
  console.log(data);

  const res = await request({ url: `/customer/${data.id}`, method: 'PATCH', data });
  return res;
};

const getCustomer = async (id) => {
  const res = await request({ url: `/customer/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useCustomerData = (id) =>
  useQuery(['editCustomerData', id], () => getCustomer(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess({ data }) {
      data.level_id = { ...data?.customer_level, label: data?.customer_level?.name, value: data?.customer_level?.id };
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, mode, customerLevelOption, onHide, onGetCustomerData }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();

  const { data: initResult, isFetching, refetch } = useCustomerData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveCustomer, isLoading: isAdding } = useMutation((currentData) => callAddMasterCustomer(currentData), {
    onSuccess(data) {
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

  const { mutate: updateCustomer, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterCustomer(currentData), {
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
    onHide();
  };

  const handleSave = () => {
    var data = {
      id: values.id,
      name: values.name || '',
      phone: values.phone || '',
      level_id: values?.level_id?.value || '',
      address: values.address || '',
      verify: values.verify,
      active: values.active,
    };

    onGetCustomerData(data);
    saveCustomer(data);
  };

  const handleChangelevel = (value) => {
    handleChange({ target: { id: 'level_id', value } });

    if (value) {
      handleChange({ target: { id: 'verify', value: true } });
    } else {
      handleChange({ target: { id: 'verify', value: false } });
    }
  };

  const handleCheck = (type, value) => {
    handleChange({ target: { id: [type], value } });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div
          className={classNames('mb-5', {
            'overlay-spinner': isFetching,
          })}
        >
          <Row className="mb-2">
            <Col sm="12" md="12" lg="6">
              <Form.Label className="col-form-label required">{f({ id: 'customer.field.name' })}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                onChange={handleChange}
                value={values?.name}
                isInvalid={errors.name && touched.name}
                readOnly={!isEditMode}
              />
              {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm="12" md="12" lg="6">
              <Form.Label className="col-form-label required">{f({ id: 'customer.field.phone' })}</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                onChange={handleChange}
                value={values?.phone}
                isInvalid={errors.phone && touched.phone}
                readOnly={!isEditMode}
              />
              {errors.phone && touched.phone && <div className="d-block invalid-feedback">{f({ id: errors.phone })}</div>}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm="12" md="12" lg="6">
              <Form.Label className="col-form-label required">{f({ id: 'customer.field.address' })}</Form.Label>
              <Form.Control
                as="textarea"
                type="text"
                name="address"
                onChange={handleChange}
                value={values?.address || ''}
                isInvalid={errors.address && touched.address}
                readOnly={!isEditMode}
              />
              {errors.address && touched.address && <div className="d-block invalid-feedback">{f({ id: errors.address })}</div>}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm="12" md="12" lg="6">
              <Form.Label className="col-form-label required">{f({ id: 'customer.field.customerLevel' })}</Form.Label>
              <Select
                classNamePrefix="react-select"
                options={customerLevelOption}
                isDisabled={!isEditMode}
                value={values?.level_id || ''}
                onChange={handleChangelevel}
                required
                isClearable
              />
              {errors.level_id && touched.level_id && <div className="d-block invalid-feedback">{f({ id: errors.level_id })}</div>}
            </Col>
          </Row>
        </div>
        <div className="page-title-container position-absolute bottom-0  mb-3" style={{ right: '50px' }}>
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row className="text-end">
                  <Col md="12">
                    <Button className="btn-icon" variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      {f({ id: 'common.back' })}
                    </Button>{' '}
                    <Button
                      className="btn-icon"
                      variant="primary"
                      type="submit"
                      onClick={handleSave}
                      hidden={mode === 'view'}
                      disabled={isAdding || isSaving || mode === 'view'}
                    >
                      {f({ id: 'common.ok' })}
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
