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
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import AutoComplete from './AutoComplete';
import ParcelList from './ParcelList';
import LovCustomerSelect from './LovSelectCustomer';
import { moackData, mockParcelData } from '../constants';

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

const callAddMasterPacking = async (data = {}) => {
  const res = await request({ url: `/packing`, method: 'POST', data });
  return res;
};

const callUpdateMasterPacking = async (data = {}) => {
  const res = await request({ url: `/packing/${data.id}`, method: 'PATCH', data });
  return res;
};

const getPacking = async (id) => {
  const res = await request({ url: `/packing/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const InformationForm = ({ id, mode, customerLevelOption }) => {
  const { formatMessage: f } = useIntl();
  const isEditMode = mode === 'new' || (mode === 'edit' && id);
  const { push } = useHistory();
  const [parcelList, setParcelList] = useState(mockParcelData);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCheckHasChange, setIsCheckHasChange] = useState();
  const [amountLakCurrency, setAmountLakCurrency] = useState({ amount_lak: 0, amount_cny: 0 });
  const [checkAll, setCheckAll] = useState([]);
  const [getRate, setGetRate] = useState();

  const useSetPackingData = (id) =>
    useQuery(['editCustomerData', id], () => getPacking(id), {
      enabled: false,
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

  const { data: initResult, isFetching, refetch } = useSetPackingData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult.data;
  }

  const formik = useFormik({ initialValues: moackData, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: savePacking, isLoading: isAdding } = useMutation((currentData) => callAddMasterPacking(currentData), {
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

  const { mutate: updatePacking, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterPacking(currentData), {
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
    push('/packing');
  };

  const handleSave = () => {
    const getFilterChecked = checkAll.filter((item) => item.checked === true);

    var data = {
      id: values?.id,
      name: values?.name || '',
      phone: values?.phone || '',
      address: values?.address || '',
      item: getFilterChecked.map((item) => item.track_no),
    };

    if (Object.keys(errors).length === 0) {
      if (!id) {
        savePacking(data);
      } else {
        updatePacking(data, values?.id);
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

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className="page-title-container mb-0">
          <Row>
            <Col>
              <div className="page-title-container mb-3">
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 font-weight-bold">Packing</h1>
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
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'bill.field.name' })}</Form.Label>
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
                <Form.Label className="col-form-label required">{f({ id: 'bill.field.phone' })}</Form.Label>
                {/* <AutoCompleteFilterCusLevel isDisable={!isEditMode || !values?.statusCheck} onChange={(value) => handleChecngePhoneNo(value)} value={values.phone} /> */}
                {!values?.statusCheck ? (
                  <Form.Control
                    type="text"
                    name="phone"
                    onChange={handleChange}
                    value={values?.phone}
                    isInvalid={errors.phone && touched.phone}
                    readOnly={!values?.statusCheck}
                  />
                ) : (
                  <LovCustomerSelect isDisabled={!values?.statusCheck} onChange={handleChecngePhoneNo} />
                )}
                {errors.phone && touched.phone && <div className="d-block invalid-feedback">{f({ id: errors.phone })}</div>}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label required">{f({ id: 'bill.field.address' })}</Form.Label>
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

            <Row className="mt-1">
              <Col sm="12" md="12" lg="12">
                <h4 className="mb-2 pb-0 font-weight-bold">{f({ id: 'bill.field.parcel-title' })}</h4>
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
                    <Button className="btn-icon text-white" variant="warning" type="submit" hidden={mode === 'view'}>
                      Pending
                    </Button>{' '}
                    <Button className="btn-icon" variant="primary" type="submit" hidden={mode === 'view'} disabled={parcelList.some(parcel => parcel.status === 'pending')}>
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
