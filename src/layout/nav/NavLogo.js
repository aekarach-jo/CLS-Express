import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_PATHS } from 'config.js';

const NavLogo = () => {
  return (
    <div className="logo position-relative mt-4">
      <Link to={DEFAULT_PATHS.APP}>
        <img width={102} height={50} src="/img/logo/cls-logo.png" alt="logo" className="rounded-sm border" />
      </Link>
    </div>
  );
};
export default React.memo(NavLogo);
