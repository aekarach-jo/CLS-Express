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
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import { useFormik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';

const initialData = {
  name: '',
  active: false,
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please provide Name Required'),
});

const callAddMasterDepartment = async (data = {}) => {
  const res = await request({ url: `/department`, method: 'POST', data });
  return res;
};

const callUpdateMasterDepartment = async (data = {}) => {
  console.log(data);

  const res = await request({ url: `/department/${data.id}`, method: 'PATCH', data });
  return res;
};

const getDepartment = async (id) => {
  const res = await request({ url: `/department/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useDepartmentData = (id) =>
  useQuery(['editDepartmentData', id], () => getDepartment(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess() {},
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, mode }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();

  const { data: initResult, isFetching, refetch } = useDepartmentData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveDepartment, isLoading: isAdding } = useMutation((currentData) => callAddMasterDepartment(currentData), {
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

  const { mutate: updateDepartment, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterDepartment(currentData), {
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
    push('/setting/department');
  };

  const handleSave = () => {
    var data = {
      id: values?.id,
      name: values?.name || '',
      description: values?.description || '-',
      active: values?.active || false,
    };

    if (Object.keys(errors).length === 0 && values?.name !== '') {
      if (!id) {
        saveDepartment(data);
      } else {
        updateDepartment(data, values?.id);
      }
    }
  };
  const handleCheck = (value) => {
    handleChange({ target: { id: 'active', value } });
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
                    {f({ id: 'department.field.create' })}
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
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'department.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'department.field.departmentName' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  onChange={handleChange}
                  placeholder={f({ id: 'department.field.departmentName' })}
                  value={values?.name}
                  // disabled={values?.id}
                  isInvalid={errors.name && touched.name}
                  readOnly={!isEditMode}
                />
                {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'department.field.description' })}</Form.Label>
                <Form.Control
                  as="textarea"
                  type="text"
                  name="description"
                  placeholder={f({ id: 'department.field.description' })}
                  onChange={handleChange}
                  value={values?.description}
                  readOnly={!isEditMode}
                />
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
                  checked={values?.active}
                  onChange={(e) => handleCheck(e.target.checked)}
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
                    <Button className="btn-icon" border variant="foreground-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
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
