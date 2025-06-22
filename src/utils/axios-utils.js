import axios from 'axios';
import { SERVICE_URL } from 'config';

export const client = axios.create({
  baseURL: SERVICE_URL,
  timeout: 1000 * 60,
  headers: {},
});

export const requestWithToken = ({ token, ...options }) => {
  client.defaults.headers.common.Authorization = `Bearer ${token}`;

  return client(options);
};

/**
 * Request with token if any and return response data
 * @param {import('axios').AxiosRequestConfig} options
 * @returns {import('axios').AxiosResponse<any>}
 */
export const request = (options) => {
  // get token from localStorage
  let token;

  try {
    const tokenObject = JSON.parse(localStorage.getItem('token'));

    token = tokenObject.access_token;
    // eslint-disable-next-line no-empty
  } catch (_a) {}

  if (token) {
    return requestWithToken({ token, ...options });
  }

  return client(options);
};

export const extractErrorResponse = (resp) => {
  const {
    response: { data },
  } = resp;

  if (data.error) {
    return data.message;
  }

  return null;
};
