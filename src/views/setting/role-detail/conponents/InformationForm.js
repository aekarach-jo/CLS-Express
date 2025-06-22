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
import React from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import { request } from 'utils/axios-utils';
import { permissionList } from '../constants';

const initialData = {
  name: '',
  active: false,
  permission: permissionList || [],
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please provide Name Required'),
});

const callAddMasterRole = async (data = {}) => {
  const res = await request({ url: `/role`, method: 'POST', data });
  return res;
};

const callUpdateMasterRole = async (data = {}) => {
  const res = await request({ url: `/role/${data.id}`, method: 'PATCH', data });
  return res;
};

const getRole = async (id) => {
  const res = await request({ url: `/role/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useRoleData = (id) =>
  useQuery(['role', id], () => getRole(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess({ data }) {
      const roleList = data.role_resource.map((item) => {
        return {
          ...item,
          resource_name: item.resource.name,
          id: item.resource.id,
        };
      });
      data.name = data.role.name;
      data.id = data.role.id;
      data.description = data.role.description;
      data.active = data.role.active;
      data.permission = roleList;
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, mode }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();

  const { data: initResult, isFetching, refetch } = useRoleData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: saveRole, isLoading: isAdding } = useMutation((currentData) => callAddMasterRole(currentData), {
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

  const { mutate: updateRole, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterRole(currentData), {
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
    push('/setting/role');
  };

  const handleSave = () => {
    var data = {
      id: values?.id || '',
      name: values?.name || '',
      description: values?.description,
      active: values?.active || false,
      permission: values?.permission,
    };

    if (Object.keys(errors).length === 0 && values?.name !== '') {
      if (!id) {
        saveRole(data);
      } else {
        updateRole(data, values?.id);
      }
    }
  };

  const handleChangePermission = (value) => {
    const { checked } = value.target;
    const name = value.target.getAttribute('name');
    const index = value.target.getAttribute('index');

    console.log({ target: { id: `permission[${index}].${name}`, value: checked } });

    handleChange({ target: { id: `permission[${index}].${name}`, value: checked } });
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
                    {f({ id: 'role.field.create' })}
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
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'role.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'role.field.name' })}</Form.Label>
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
                <Form.Label className="col-form-label required">{f({ id: 'role.field.description' })}</Form.Label>
                <Form.Control type="text" as="textarea" name="description" onChange={handleChange} value={values?.description} readOnly={!isEditMode} />
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
                  onChange={(e) => handleCheck('active', e.target.checked)}
                  disabled={!isEditMode}
                />
              </Col>
            </Row>
            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'role.field.permission' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2 px-7">
              {values?.permission?.map((item, i) => (
                <Col sm="12" md="12" lg="12" key={i}>
                  <Row className=" border-bottom py-2 pt-3 gap-4">
                    <Col
                      sm="5"
                      md="5"
                      lg="5"
                      className={`${
                        item.resource_name === 'Menu' || item.resource_name === 'Report' || item.resource_name === 'Setting' ? 'font-weight-bold' : ''
                      }`}
                    >
                      {item.resource_name}
                    </Col>
                    {item.resource_name !== 'Menu' && item.resource_name !== 'Report' && item.resource_name !== 'Setting' && (
                      <>
                        <Col sm="1" md="1" lg="1">
                          <Form.Check
                            type="checkbox"
                            label={f({ id: 'common.view' })}
                            id="can_view"
                            name="can_view"
                            index={i}
                            onChange={handleChangePermission}
                            disabled={!isEditMode}
                            checked={item.can_view}
                          />
                        </Col>
                        <Col sm="1" md="1" lg="1">
                          <Form.Check
                            type="checkbox"
                            label={f({ id: 'common.create' })}
                            id="can_create"
                            name="can_create"
                            index={i}
                            onChange={handleChangePermission}
                            disabled={!isEditMode}
                            checked={item.can_create}
                          />
                        </Col>
                        <Col sm="1" md="1" lg="1">
                          <Form.Check
                            type="checkbox"
                            label={f({ id: 'common.update' })}
                            id="can_update"
                            name="can_update"
                            index={i}
                            onChange={handleChangePermission}
                            disabled={!isEditMode}
                            checked={item.can_update}
                          />
                        </Col>
                        <Col sm="1" md="1" lg="1">
                          <Form.Check
                            type="checkbox"
                            label={f({ id: 'common.delete' })}
                            id="can_delete"
                            name="can_delete"
                            index={i}
                            onChange={handleChangePermission}
                            disabled={!isEditMode}
                            checked={item.can_delete}
                          />
                        </Col>
                        <Col sm="1" md="1" lg="1">
                          <Form.Check
                            type="checkbox"
                            label={f({ id: 'common.export' })}
                            id="can_export"
                            name="can_export"
                            index={i}
                            onChange={handleChangePermission}
                            disabled={!isEditMode}
                            checked={item.can_export}
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                </Col>
              ))}
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
                    <Button className="btn-icon" variant="primary" hidden={mode === 'view'} type="submit" onClick={handleSave} disabled={isAdding || isSaving}>
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
