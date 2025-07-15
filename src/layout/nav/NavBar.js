import React, { useEffect } from 'react';
import { Col, Dropdown } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import useLayout from 'hooks/useLayout';
import { useIsMobile } from 'hooks/useIsMobile';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import NavLanguageSwitcher from './NavLanguageSwitcher';
import NavMobileButtons from './NavMobileButtons';

const NavBar = ({ children }) => {
  useLayout();
  const { pathname } = useLocation();
  const { push } = useHistory();
  const getName = JSON.parse(localStorage.getItem('token'));
  useEffect(() => {
    document.documentElement.click();
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = () => {
    push('/logout');
  };

  return (
    <Col className="h-100">
      <nav
        style={{ height: '68px', background: 'white', zIndex: '1002', position: 'static' }}
        className="text-center d-flex flex-row justify-content-between align-items-center px-5"
      >
        {useIsMobile() && <NavMobileButtons />}
        <div className=" d-flex flex-row justify-content-between align-items-center ">
          <img src="/img/logo/cls-logo.png" alt="logo" style={{ width: '77px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
          {/* <h1 style={{ color: 'red', fontWeight: '700', marginLeft: '1rem', lineHeight: '2rem'}}>(UAT)</h1> */}
        </div>
        <Dropdown className="d-inline-block">
          <Dropdown.Toggle className="mb-1 cursor-pointer" as="p" href="#">
            <img src="/img/profile/profile-5.webp" alt="profile" className="rounded-circle mx-2" style={{ width: '39px', height: '39px' }} />
            {`${getName?.user?.first_name || ''} ${getName?.user?.last_name || ''}`}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>
              <NavLanguageSwitcher />
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>
              <CsLineIcons icon="logout" className="me-2" size="17" /> <span className="align-middle">Logout</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </nav>
      <Col id="contentArea">{children}</Col>
    </Col>
  );
};

export default NavBar;
