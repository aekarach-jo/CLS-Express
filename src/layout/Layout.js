/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import clx from 'classnames';
import { useLocation } from 'react-router-dom';
import useLayout from 'hooks/useLayout';
import { useIsMobile } from 'hooks/useIsMobile';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useIntl } from 'react-intl';
import Nav from 'layout/nav/Nav';
import NavBar from './nav/NavBar';

const Layout = ({ children }) => {
  useLayout();
  const { formatMessage: f } = useIntl();
  const currencyStatus = JSON.parse(localStorage.getItem('token'))?.setting_currency || '';
  const getLoginDate = moment(localStorage.getItem('login_date')).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD');
  const [show, setShow] = useState(false);
  const { push } = useHistory();
  const { pathname } = useLocation();

  const searchCurrency = async () => {
    const filter = {
      start_at: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
      end_at: moment(new Date()).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await request({
      url: '/currency',
      method: 'GET',
      params: { ...filter },
    });
    return res.data.data.length === 0;
  };

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const dontHaveCurrencyData = await searchCurrency();
        setShow(dontHaveCurrencyData);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, [pathname]);

  if (!getLoginDate) {
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 100);
    clearTimeout();
  }
  useEffect(() => {
    document.documentElement.click();
    window.scrollTo(0, 0);
    // eslint-disable-next-line
  }, [pathname]);

  // useEffect(() => {
  //   if (!currencyStatus) {
  //     setShow(true);
  //   }
  // }, [currencyStatus]);

  const onCancel = () => {
    setShow(false);
  };

  const onConfirm = () => {
    push('/setting/currency/new');
    setShow(false);
  };

  return (
    <NavBar>
      <Nav />
      <main className={`${useIsMobile() ? 'py-4' : ''}`}>
        <Row className="h-100">
          <Col className={`${useIsMobile() ? 'py-0' : 'py-5'} h-100`} id="contentArea">
            {children}
          </Col>
        </Row>
        <Modal className={clx('small fade ')} show={show} onHide={onCancel} centered backdrop="static">
          <Modal.Body className="d-flex flex-column gap-3 text-center">
            <div className="d-flex jutify-center m-auto" style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#ECF2FF' }}>
              <CsLineIcons className="m-auto text-primary" icon="bell" size="" />
            </div>
            <div>
              <Modal.Title className="font-weight-bold">Create Currency</Modal.Title>
              <div style={{ fontFamily: 'Inter' }}>Date {moment().format('YYYY-MM-DD')}</div>
            </div>
            <div className="d-flex flex-row gap-2 justify-content-center">
              <Button variant="primary" className="text-white" onClick={onConfirm}>
                {f({ id: 'common.continue' })}
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </main>
    </NavBar>
  );
};

export default React.memo(Layout);
