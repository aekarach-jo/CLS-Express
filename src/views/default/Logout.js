import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { logout } from 'utils/auth';
import { menuResetUsePlacement } from 'layout/nav/main-menu/menuSlice';
import { settingsResetColor } from 'settings/settingsSlice';

const Logout = () => {
  const { replace } = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const logoutFn = async () => {
      await logout();
      dispatch(menuResetUsePlacement());
      dispatch(settingsResetColor());
      replace('/');
    };

    logoutFn();
  }, [dispatch, replace]);

  return <div>Logging out...</div>;
};

export default Logout;
