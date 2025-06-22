import React, { useMemo } from 'react';
import { Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getMenuItems } from 'routing/helper';
import routesAndMenuItems from 'routes.js';
import { useToken } from 'utils/auth';
import SidebarMenuItems from './SidebarMenuItems';

const SidebarMenu = () => {
  const token = useToken();

  // const { isLogin, currentUser } = useSelector((state) => state.auth);
  const { useSidebar } = useSelector((state) => state.menu);

  const menuItemsMemo = useMemo(
    () =>
      getMenuItems({
        data: routesAndMenuItems.sidebarItems,
        isLogin: !!token,
        userRole: 'user',
      }),
    [token]
  );

  if (!useSidebar === true) {
    return <></>;
  }
  return (
    <Col xs="auto" className="side-menu-container">
      <ul className="sw-25 side-menu mb-0 primary" id="menuSide">
        <SidebarMenuItems menuItems={menuItemsMemo} />
      </ul>
    </Col>
  );
};
export default SidebarMenu;
