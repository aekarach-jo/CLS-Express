import { decodeToken } from 'react-jwt';
import { client } from './axios-utils';
import createTokenQuery from './create-token-query';

/**
 * @typedef {import('./create-token-query').Config} Config
 * @typedef {import('./auth.types').ITokenData} ITokenData
 * @typedef { import('./auth.types').ILoginRequest } ILoginRequest
 * @typedef { import('./auth.types').ILoginResponse } ILoginResponse
 * @typedef { import('./auth.types').IRefreshTokenRequest } IRefreshTokenRequest
 * @typedef { import('./auth.types').IRefreshTokenResponse } IRefreshTokenResponse
 */

//

const tokenExpired = (token) => {
  const now = new Date().getTime();
  const tk = decodeToken(token.token);
  return tk?.exp * 1000 < now;
};
const refreshExpired = (token) => {
  const now = new Date().getTime();
  const tk = decodeToken(token.refreshToken);

  return tk?.exp * 1000 < now;
};

/**
 * @param {ILoginRequest} params
 * @returns
 */
const sendLogin = async ({ email, password }) => {
  /**
   * @type {import('axios').AxiosResponse<ILoginResponse>}
   */
  const response = await client({
    url: '/login',
    method: 'POST',
    data: {
      email,
      password,
    },
  });

  return response.data;
};

/**
 * @param {IRefreshTokenRequest} params
 * @returns
 */
const sendRefresh = async ({ username, refreshToken }) => {
  /**
   * @type {import('axios').AxiosResponse<IRefreshTokenResponse>}
   */

  const response = await client({
    url: '/auth/token',
    method: 'POST',
    data: {
      username,
      refreshToken,
    },
  });

  return response.data;
};

const retry = (count, error) => count < 3 && !(error.message.includes('401-') || error.message.includes('422'));
const shouldRefreshOnBackground = (token) => {
  // console.debug('Should refresh on background', token);
  const REFRESH_TIME_BEFORE_EXPIRE = 1000 * 60 * 1;
  const now = new Date().getTime();
  return now > token.token - REFRESH_TIME_BEFORE_EXPIRE;
};

const auth = createTokenQuery({
  queryKey: 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  // sendRefresh,
  retry,
  refreshExpiredError: new Error('401-Refresh token expired'),
  shouldRefreshOnBackground,
});
auth.init(1000 * 60); // 1min

/* eslint-disable prefer-destructuring */

/**
 * @type { () => {token: ITokenData, isLoading: boolean} }
 */
export const useToken = auth.useToken;
export const useLogin = auth.useLogin;
export const logout = auth.logout;
export const refresh = auth.refresh;

/**
 * @type { (force?: boolean) => ITokenData }
 */
export const getToken = auth.getToken;
/* eslint-enable prefer-destructuring */

export default auth;
