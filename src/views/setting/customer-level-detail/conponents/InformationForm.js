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
import { request } from 'utils/axios-utils';
import { useMutation, useQuery } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';


const initialData = {
  name: '',
  rate: '',
  active: false,
  rate_weights: [],
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please provide name Required'),
  rate: Yup.string().required('Please provide rate Required'),
  rate_weights: Yup.array().of(
    Yup.object().shape({
      weight: Yup.number()
        .min(0, 'Weight must be greater than or equal to 0')
        .required('Weight is required')
        .test('unique-weight', 'Weight value must be unique', function (value) {
          const { parent, from } = this;
          const allWeights = from[1].value.rate_weights || [];

          // ค้นหา weight ที่เหมือนกัน (ไม่รวมตัวเอง)
          const duplicates = allWeights.filter((item, index) => {
            return item.weight === value && index !== allWeights.indexOf(parent);
          });

          // อนุญาต weight = 0 หรือไม่มีการซ้ำ
          return value === 0 || duplicates.length === 0;
        }),
      rate: Yup.number()
        .min(0, 'Rate must be greater than or equal to 0')
        .required('Rate is required'),
    })
  ),
});

const callAddMasterLevel = async (data = {}) => {
  const res = await request({ url: `/customer_level`, method: 'POST', data });
  return res;
};

const callUpdateMasterLevel = async (data = {}) => {
  console.log(data);

  const res = await request({ url: `/customer_level/${data.id}`, method: 'PATCH', data });
  return res;
};

const getLevel = async (id) => {
  const res = await request({ url: `/customer_level/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const useLevelData = (id) =>
  useQuery(['editLevelData', id], () => getLevel(id), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
    retry: 0,
    onError(err) {
      console.error('Error:', err);
    },
  });

const InformationForm = ({ id, isLoading, setIsLoading, mode }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();
  const [rateWeightsChanges, setRateWeightsChanges] = useState({});

  const { data: initResult, isFetching, refetch } = useLevelData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors, setFieldTouched, validateForm } = formik;

  const { mutate: saveLevel, isLoading: isAdding } = useMutation((currentData) => callAddMasterLevel(currentData), {
    onSuccess(data) {
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

  const { mutate: updateLevel, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterLevel(currentData), {
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
    push('/setting/customer-level');
  };

  const handleSave = () => {
    // เตรียมข้อมูล rate_weights พร้อม status
    const processedRateWeights = values?.rate_weights?.map((item, index) => {
      const hasChanges = rateWeightsChanges[index];
      return hasChanges ? { ...item, edit: true } : item;
    }) || [];

    var data = {
      id: values?.id,
      name: values?.name || '',
      description: values.description || '-',
      rate: values?.rate || '',
      active: values?.active || false,
      rate_weights: processedRateWeights,
    };

    if (Object.keys(errors).length === 0) {
      handleSubmit();
      if (!id) {
        saveLevel(data);
      } else {
        updateLevel(data, values?.id);
      }
    }
  };

  const handleCheck = (type, value) => {
    handleChange({ target: { id: [type], value } });
  };

  const handleRateWeightChange = (index, field, value) => {
    const inputValue = value.target.value;
    console.log('Input value:', inputValue);

    // อนุญาตให้ค่าว่างหรือตัวเลขเท่านั้น (รวม 0)
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      const numValue = inputValue === '' ? 0 : Number(inputValue);
      console.log('Converted number:', numValue);

      const updatedRateWeights = [...(values?.rate_weights || [])];
      updatedRateWeights[index] = {
        ...updatedRateWeights[index],
        [field]: numValue
      };

      setRateWeightsChanges(prev => ({
        ...prev,
        [index]: true
      }));

      // อัปเดตค่าและ touched state สำหรับ validation
      handleChange({ target: { id: 'rate_weights', value: updatedRateWeights } });

      // ทำเครื่องหมาย touched สำหรับ field นี้
      setFieldTouched(`rate_weights.${index}.${field}`, true);

      // ถ้าเป็น weight field ให้ validate ทั้ง array
      if (field === 'weight') {
        // ทำเครื่องหมาย touched สำหรับ weight fields ทั้งหมด
        values?.rate_weights?.forEach((item, i) => {
          setFieldTouched(`rate_weights.${i}.weight`, true);
        });

        // Trigger validation สำหรับ rate_weights ทั้งหมด
        setTimeout(() => {
          validateForm();
        }, 50);
      }
    }
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
                    {f({ id: 'customerLevel.field.create' })}
                  </h1>
                </Col>
              </div>
            </Col>
          </Row>
        </div>
        <Card
          className={classNames('mb-5', {
            'overlay-spinner': isLoading,
          })}
        >
          <Card className="rounded-sm p-4" style={{ minHeight: '65vh' }}>
            <Row className="my-3">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'customerLevel.field.info' })}</h4>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'customerLevel.field.levelName' })}</Form.Label>
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
                <Form.Label className="col-form-label required">{f({ id: 'customerLevel.field.description' })}</Form.Label>
                <Form.Control
                  as="textarea"
                  style={{ height: '5rem' }}
                  type="text"
                  name="description"
                  onChange={handleChange}
                  value={values?.description}
                  isInvalid={errors.description && touched.description}
                  readOnly={!isEditMode}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              <Form.Label className="col-form-label required">{f({ id: 'customerLevel.field.rateKip' })}</Form.Label>
              {values?.rate_weights?.map((item, index) => (
                <Col sm="12" md="4" lg="2" key={index}>
                  <Form.Label className="col-form-label required text-center w-100 pe-3">Weight | Rate</Form.Label>
                  <InputGroup style={{ height: '3rem', marginBottom: '10px' }}>
                    <FormControl
                      value={item.weight}
                      className="font-weight-bold"
                      onChange={(e) => handleRateWeightChange(index, 'weight', e)}
                      readOnly={!isEditMode}
                      type="number"
                      isInvalid={
                        errors.rate_weights?.[index]?.weight &&
                        touched.rate_weights?.[index]?.weight
                      }
                    />
                    <FormControl
                      value={item.rate}
                      className="font-weight-bold"
                      onChange={(e) => handleRateWeightChange(index, 'rate', e)}
                      readOnly={!isEditMode}
                      type="number"
                      isInvalid={
                        errors.rate_weights?.[index]?.rate &&
                        touched.rate_weights?.[index]?.rate
                      }
                    />
                  </InputGroup>
                  {/* Weight validation error */}
                  {errors.rate_weights?.[index]?.weight && touched.rate_weights?.[index]?.weight && (
                    <div className="text-danger mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                      {errors.rate_weights[index].weight}
                    </div>
                  )}
                  {/* Rate validation error */}
                  {errors.rate_weights?.[index]?.rate && touched.rate_weights?.[index]?.rate && (
                    <div className="text-danger mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                      {errors.rate_weights[index].rate}
                    </div>
                  )}
                </Col>
              ))}
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
                    </Button>
                    <Button className="btn-icon" variant="primary" hidden={mode === 'view'} type="submit" onClick={handleSave} disabled={isAdding || isSaving || Object.keys(errors).length > 0}>
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
