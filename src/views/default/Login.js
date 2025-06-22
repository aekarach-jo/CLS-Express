import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLogin } from 'utils/auth';
import clx from 'classnames';
import { request } from 'utils/axios-utils';
import Currency from './Currency';

const Login = () => {
  const { replace } = useHistory();
  const { requestLogin, isFetching } = useLogin();
  const [isShow, setIsShow] = useState(false);

  const { formatMessage: f } = useIntl();

  const title = f({ id: 'auth.login' });
  const description = f({ id: 'auth.description' });

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(f({ id: 'auth.validation.email.required' })),
    password: Yup.string()
      // .min(8, 'Must be at least 6/ chars!')
      .required(f({ id: 'auth.validation.password.required' })),
  });
  const initialValues = { email: '', password: '' };
  const onSubmit = async (values) => {
    // console.log('submit form', values);

    try {
      console.log('test 1');
      await requestLogin(values, true);
      setIsShow(true);
    } catch (err) {
      console.error('Login error :  ', err);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const handleChangeCurrency = () => {
    replace('/');
  };

  const leftSide = (
    <div className="min-h-100 d-flex align-items-center">
      <div className="w-100 w-lg-75 w-xxl-50">
        <div>
          <div className="mb-5">
            <img className="w-100" src="/img/logo/logo.png" alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  );

  const rightSide = (
    <div
      className={clx('sw-lg-100 min-h-100 d-flex justify-content-center align-items-center shadow-deep py-5', {
        'overlay-spinner': isFetching,
      })}
      style={{ background: '#f9f9f9' }}
    >
      <div
        className="p-4 d-flex flex-column justify-content-center align-items-center rounded-sm"
        style={{ width: '540px', height: '458px', background: 'white' }}
      >
        <div className="mb-5">
          <h1 className="text-center font-weight-bold text-black" style={{ fontSize: '32px', lineHeight: '44px' }}>
            {f({ id: 'auth.login' })}
          </h1>
        </div>
        <div className="w-100">
          <form id="loginForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <div className="mb-3 form-group tooltip-end-top">
              <Form.Label className="col-form-label">{f({ id: 'auth.email' })}</Form.Label>
              <Form.Control
                type="text"
                name="email"
                className="rounded-sm sh-6"
                placeholder="Enter Email Address"
                value={values.email}
                onChange={handleChange}
                disabled={isFetching}
              />
              {errors.email && touched.email && (
                <div className="d-block invalid-tooltip" style={{ color: '#fff' }}>
                  {errors.email}
                </div>
              )}
            </div>
            <div className="mb-3 form-group tooltip-end-top">
              <Form.Label className="col-form-label">{f({ id: 'auth.password' })}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                className="rounded-sm sh-6"
                onChange={handleChange}
                value={values.password}
                placeholder="Enter Password"
                disabled={isFetching}
              />
              {errors.password && touched.password && (
                <div className="d-block invalid-tooltip" style={{ color: '#fff' }}>
                  {errors.password}
                </div>
              )}
            </div>
            <Button className="w-100 mt-3" size="lg" type="submit">
              {f({ id: 'auth.login' })}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <LayoutFullpage left={leftSide} right={rightSide} />
      {isShow && <Currency show={isShow} onHide={() => setIsShow(false)} onChange={handleChangeCurrency} />}
    </>
  );
};

export default Login;
