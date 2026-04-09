import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getData } from '../hooks/useAsyncStorage';

export const WEB_CLIENT_ID = `112843665462-q6gj7rihjlc3s08i36vd2jiq9l40qhet.apps.googleusercontent.com`;

const isLive = true;

export const HOST = isLive
  ? 'https://cupid-flow.dilmil.fun'
  : 'http://192.168.0.120:5050';

export const testUrl = `${HOST}/api/v1/`;
export const baseUrl: string = testUrl;

// Standard Axios Instance
const API_AXIOS: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for attaching the token
API_AXIOS.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const authToken = await getData('authToken');
    if (authToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export { API_AXIOS };

// Multipart Axios Instance
const API_AXIOS_MULTIPART: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 50000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for attaching the token to multipart requests
API_AXIOS_MULTIPART.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const authToken = await getData('authToken');
    if (authToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export { API_AXIOS_MULTIPART };
