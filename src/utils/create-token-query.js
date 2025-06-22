// Original from https://github.com/killerchip/token-query

import { useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import queryClient from './query-client';

const queryCache = queryClient.getQueryCache();

/**
 * @typedef { import('./create-token-query.types').Config<TToken, TLoginParams> } Config
 */

/**
 * @param {Config} params
 */
function createTokenQuery({ queryKey = 'token', tokenExpired, refreshExpired, sendLogin, sendRefresh, retry, refreshExpiredError, shouldRefreshOnBackground }) {
  let tokenRefreshIntervalHandler;
  let tokenRefreshInterval;
  const getTokenFromStorage = () => {
    const storedValue = localStorage.getItem(queryKey);
    if (!storedValue) {
      return undefined;
    }
    let token;
    try {
      token = JSON.parse(storedValue);
      // eslint-disable-next-line no-empty
    } catch (_a) {}
    return token;
  };
  const setTokenValue = (token) => {
    if (token === undefined) {
      localStorage.removeItem(queryKey);
      localStorage.removeItem('login_date');
    } else {
      localStorage.setItem(queryKey, JSON.stringify(token));
    }
    queryClient.setQueryData(queryKey, token);
  };
  const refresh = async () => {
    let token = queryClient.getQueryData(queryKey);

    if (!token) {
      token = getTokenFromStorage();
    }

    const newToken = await queryClient.fetchQuery({
      queryKey: [`temp-refresh-${queryKey}`],
      queryFn: () =>
        sendRefresh({
          username: token?.user?.username,
          refreshToken: token?.refreshToken,
        }),
      retry,
    });

    let tokenObj = token;

    // If token is undefined then refresh has failed
    if (newToken !== undefined) {
      tokenObj = {
        ...token,
        token: newToken.token,
      };
      setTokenValue(tokenObj);
      // console.debug('Update new token from refreshing :', newToken);
    }
    queryClient.removeQueries(`temp-refresh-${queryKey}`);
    return tokenObj;
  };
  const startBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);
    tokenRefreshIntervalHandler = setInterval(() => {
      // refresh();
    }, tokenRefreshInterval);
  };
  const stopBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);
  };
  // eslint-disable-next-line consistent-return
  const login = async (loginParams) => {
    const token = await queryClient.fetchQuery({
      queryKey: [`temp-login-${queryKey}`],
      queryFn: () => sendLogin(loginParams),
      retry,
    });
    if (tokenRefreshInterval) {
      startBackgroundRefreshing();
    }
    queryClient.removeQueries(`temp-login-${queryKey}`);
    return token;
  };
  const logout = async () => {
    setTokenValue(undefined);
    stopBackgroundRefreshing();
  };
  const useLogin = () => {
    const [data, setData] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const requestLogin = async (loginParams, throwOnError = false) => {
      setIsFetching(true);
      setData(null);
      setError(null);
      try {
        const token = await login(loginParams);
        setIsFetching(false);
        setData(token);
        setTokenValue(token);
        localStorage.setItem('login_date', new Date());
        return token;
      } catch (loginError) {
        setIsFetching(false);
        setError(loginError);
        if (throwOnError) {
          throw loginError;
        }
      }
      return undefined;
    };
    return { data, isFetching, error, requestLogin };
  };
  const getToken = async (force = false) => {
    // console.debug('Getting token, force ?', force);
    const token = queryClient.getQueryData(queryKey) || getTokenFromStorage();

    // console.debug('Token from cache:', token);

    if (token === undefined) return undefined;
    if (refreshExpired(token)) {
      // console.debug('Refresh token expired, throwing...');
      throw refreshExpiredError;
    }
    if (tokenExpired(token) || force) {
      return refresh(true);
    }
    if (shouldRefreshOnBackground && shouldRefreshOnBackground(token)) {
      // console.debug('Token should be refreshed on background, refreshing...');
      refresh();
    }
    return token;
  };
  const useToken = () => {
    const [isLoading, setLoading] = useState(true);
    const [token, setToken] = useState(queryClient.getQueryData(queryKey) || getTokenFromStorage());

    useEffect(() => {
      let isUnmounted = false;
      getToken()
        .then((t) => !isUnmounted && setToken(t))
        .catch(console.error)
        .finally(() => setLoading(false));

      // console.debug('useToken useEffect');
      const unsubscribe = queryCache.subscribe((newQueryCache) => {
        // const newToken = newQueryCache.getQueryData([queryKey]);
        // console.debug('Query cache:', newQueryCache.query.queryKey, ' event :', newQueryCache);

        // Should update only new Token
        if (newQueryCache.query.queryKey === queryKey && newQueryCache.type === 'queryUpdated') {
          const newToken = newQueryCache.query.state.data;
          if (!isUnmounted && !isEqual(token, newToken)) {
            setToken(newToken);
            // console.debug('Updated new token:', newToken);
          }
        }
      });
      return () => {
        isUnmounted = true;
        unsubscribe();
      };
    }, [token]);
    return { token, isLoading };
  };
  const init = async (refreshInterval) => {
    if (refreshInterval) {
      tokenRefreshInterval = refreshInterval;
    }
    let token = getTokenFromStorage();
    if (!token || refreshExpired(token)) {
      setTokenValue(undefined);
      return;
    }

    if (tokenExpired(token)) {
      token = await refresh();
    }

    setTokenValue(token);
    if (refreshInterval) {
      startBackgroundRefreshing();
    }
  };
  return { init, useLogin, useToken, logout, refresh, getToken };
}
export default createTokenQuery;
