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
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import classNames from 'classnames';
import { request } from 'utils/axios-utils';

const initialData = {
  id: '',
  email: '',
  name: '',
  password: '',
  department_id: '',
  role_id: '',
  active: false,
};

const validationSchema = Yup.object().shape({
  email: Yup.string().required('Please provide email Required'),
  name: Yup.string().required('Please provide name Required'),
  password: Yup.string()
    .required('Please provide password Required')
    .min(8, 'Password must be at least 8 characters'),
  department_id: Yup.object().required('Please provide department Required'),
  role_id: Yup.object().required('Please provide role Required'),
});

const callAddMasterUser = async (data = {}) => {
  const res = await request({ url: `/users`, method: 'POST', data });
  return res;
};

const callUpdateMasterUser = async (data = {}) => {
  console.log(data);

  const res = await request({ url: `/users/${data.id}`, method: 'PATCH', data });
  return res;
};

const getUser = async (id) => {
  const res = await request({ url: `/users/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useUserData = (id) =>
  useQuery(['editUserData', id], () => getUser(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess({ data }) {
      data.department_id = { ...data.user, label: data.department_data?.name, value: data.department_data?.id };
      data.role_id = { ...data.user, label: data.role_data?.name, value: data.role_data?.id };
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, mode, department, roleOption }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();

  const { data: initResult, isFetching, refetch } = useUserData(id);

  const init = id === undefined ? initialData : initResult.data || initialData;

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveUser, isLoading: isAdding } = useMutation((currentData) => callAddMasterUser(currentData), {
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

  const { mutate: updateUser, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterUser(currentData), {
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
    push('/setting/user');
  };

  const handleSave = () => {
    var data = {
      id: values?.id,
      email: values?.email,
      name: values?.name || '',
      password: values?.password,
      department_id: values?.department_id?.value || values?.department_id || '',
      role_id: values?.role_id?.value || values?.role_id || '',
      active: values?.active || false,
    };

    if (Object.keys(errors).length === 0 && values.password !== '') {
      if (!id) {
        saveUser(data);
      } else {
        updateUser(data, values?.id);
      }
    }
  };

  const handleChangeDepartment = (value) => {
    handleChange({ target: { id: 'department_id', value } });
  };

  const handleChangeRole = (value) => {
    handleChange({ target: { id: 'role_id', value } });
  };

  const handleCheck = (type, value) => {
    handleChange({ target: { id: [type], value } });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
      <div className="page-title-container mb-0">
          <Row>
            <Col className="mb-0">
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">
                    {mode === 'new' ? f({ id: 'common.create' }) : mode === 'edit' ? f({ id: 'common.edit' }) : f({ id: 'common.view' })}{' '}
                    {f({ id: 'user.field.create' })}
                  </h1>
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
            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'user.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'user.field.email' })}</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder={f({ id: 'user.field.email' })}
                  value={values?.email || ''}
                  isInvalid={errors.email && touched.email}
                  readOnly={!isEditMode}
                />
                {errors.email && touched.email && <div className="d-block invalid-feedback">{f({ id: errors.email })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'user.field.password' })}</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={handleChange}
                  placeholder={f({ id: 'user.field.password' })}
                  value={values?.password || ''}
                  isInvalid={errors.password && touched.password}
                  readOnly={!isEditMode}
                />
                {errors.password && touched.password && <div className="d-block invalid-feedback">{f({ id: errors.password })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'user.field.name' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder={f({ id: 'user.field.name' })}
                  onChange={handleChange}
                  value={values?.name || ''}
                  isInvalid={errors.name && touched.name}
                  readOnly={!isEditMode}
                />
                {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'user.field.department' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={department}
                  isDisabled={!isEditMode}
                  value={values?.department_id || ''}
                  required
                  onChange={handleChangeDepartment}
                />
                {errors.department_id && touched.department_id && <div className="d-block invalid-feedback">{f({ id: errors.department_id })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'user.field.role' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={roleOption}
                  isDisabled={!isEditMode}
                  value={values?.role_id || ''}
                  required
                  onChange={handleChangeRole}
                />
                {errors.role_id && touched.role_id && <div className="d-block invalid-feedback">{f({ id: errors.role_id })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Check
                  type="switch"
                  label={f({ id: values?.active ? 'common.active' : 'common.inactive' })}
                  className="mt-2"
                  id="active"
                  name="active"
                  checked={values?.active || false}
                  onChange={(e) => handleCheck('active', e.target.checked)}
                  isInvalid={errors.active && touched.active}
                  disabled={!isEditMode}
                />
                {errors.active && touched.active && <div className="d-block invalid-tooltip">{f({ id: errors.active })}</div>}
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
                    <Button className="btn-icon" variant="primary" hidden={mode === 'view'} type="submit" onClick={handleSave} disabled={isAdding || isSaving || mode === 'view'}>
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
