import { LAYOUT, MENU_BEHAVIOUR, NAV_COLOR, MENU_PLACEMENT, RADIUS, THEME_COLOR, USER_ROLE } from 'constants.js';

export const IS_DEMO = true;
export const IS_AUTH_GUARD_ACTIVE = true;
export const USE_MULTI_LANGUAGE = true;

// export const SERVICE_URL = 'https://0e0e-202-137-130-174.ngrok-free.app/backend-ZTO/api';
export const SERVICE_URL = 'https://uat-backend.tt-tradingsole.com/api';
// export const SERVICE_URL = 'https://backend.tt-tradingsole.com/api';

// For detailed information: https://github.com/nfl/react-helmet#reference-guide
export const REACT_HELMET_PROPS = {
  defaultTitle: 'CLS-express',
  titleTemplate: '%s | CLS-express',
};

export const DEFAULT_PATHS = {
  APP: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USER_WELCOME: '/dashboards/default',
  NOTFOUND: '/page-not-found',
  UNAUTHORIZED: '/unauthorized',
  INVALID_ACCESS: '/invalid-access',
  LOGOUT: '/logout',
};

export const DEFAULT_SETTINGS = {
  MENU_PLACEMENT: MENU_PLACEMENT.Vertical,
  MENU_BEHAVIOUR: MENU_BEHAVIOUR.Pinned,
  LAYOUT: LAYOUT.Boxed,
  RADIUS: RADIUS.Rounded,
  COLOR: THEME_COLOR.LightGreen,
  NAV_COLOR: NAV_COLOR.Default,
  USE_SIDEBAR: false,
};

export const DEFAULT_USER = {
  id: 1,
  name: 'Lisa Jackson',
  thumb: '/img/profile/profile-2.webp',
  role: USER_ROLE.Admin,
  email: 'lisajackson@gmail.com',
};

export const REDUX_PERSIST_KEY = 'classic-dashboard';
