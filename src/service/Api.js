import axios from 'axios';

import {logout} from '../redux/AuthSlice';
import {store} from '../redux/Store';
import {showToast as Toast, simpleToast} from '../util/Toast';
import {
  API_EXPERT_DETAILS_RATING,
  API_UPDATE_FCB,
  BASE_URL,
} from './apiEndPoint';
import {useToast} from 'react-native-toast-notifications';
import {showToast} from '../redux/toastSlice';
import {Alert, Platform} from 'react-native';

const Api = axios.create({
  baseURL: BASE_URL,
});

Api.interceptors.request.use(req => {
  console.log(req.baseURL + req.url);
  const token = store?.getState()?.AuthSlice?.token;
  console.log('Token');
  console.log(token);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Fix Content-Type: many endpoints use FormData (multipart). If we send the wrong
  // header (e.g. x-www-form-urlencoded), Android will fail with "Network Error".
  const isFormData =
    (typeof FormData !== 'undefined' && req.data instanceof FormData) ||
    (req?.data &&
      typeof req.data === 'object' &&
      Array.isArray(req.data._parts));

  if (isFormData) {
    req.headers['Content-Type'] = 'multipart/form-data';
  } else if (req.data != null && typeof req.data === 'object') {
    req.headers['Content-Type'] = 'application/json';
  }
  return req;
});

const delay = ms => new Promise(res => setTimeout(res, ms));

Api.interceptors.response.use(
  async response => {
    console.log(response?.data);

    await delay(500);

    if (response.data.status === 'RC300') {
      store.dispatch(logout());
    }

    // if (response?.data?.status === 'RC200') {
    //   if (response?.data?.message != 'Token updated successfully') {
    //     response?.data?.message && showToast(response?.data?.message);
    //   }

    //   return response?.data;
    // }

    const skipToast = !!response?.config?.skipSuccessToast;

    if (response?.data?.status === 'RC200') {
      let arr = response.request.responseURL.split('/');
      arr = arr[arr.length - 1];
      if (!skipToast && arr != API_UPDATE_FCB) {
        if (Platform.OS == 'android') {
          response?.data?.message &&
            store.dispatch(showToast(response?.data?.message));
        } else {
          response?.data?.message && simpleToast(response?.data?.message);
        }
      }

      return response?.data;
    }

    if (response.data.status === 'RC100') {
      if (!skipToast) {
        Platform.OS == 'android'
          ? store.dispatch(showToast(response.data.message))
          : simpleToast(response.data.message);
      }
      return response?.data;
    }

    if (response.data.status === 'RC400') {
      store.dispatch(logout());
    } else {
      if (!skipToast && response?.data?.message) {
        store.dispatch(showToast(response?.data?.message));
      }
      return response?.data;
    }
  },
  error => {
    const res = error?.response;
    if (res?.status === 401) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              store.dispatch(logout());
            },
          },
        ],
        {cancelable: false},
      );
      return Promise.reject(error);
    }

    try {
      const cfg = error?.config || {};
      const fullUrl =
        cfg?.baseURL && cfg?.url
          ? `${cfg.baseURL}${cfg.url}`
          : cfg?.url || cfg?.baseURL || '';

      // Axios "Network Error" usually has no response; request may still contain useful fields.
      const req = error?.request;

      console.log(
        'AXIOS_ERROR_FULL',
        JSON.stringify(
          {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            isAxiosError: !!error?.isAxiosError,
            url: fullUrl,
            method: cfg?.method,
            timeout: cfg?.timeout,
            headers: cfg?.headers,
            data: cfg?.data,
            response: res
              ? {
                  status: res.status,
                  statusText: res.statusText,
                  headers: res.headers,
                  data: res.data,
                }
              : null,
            request: req
              ? {
                  status: req.status,
                  readyState: req.readyState,
                  responseURL: req.responseURL,
                  responseText:
                    typeof req.responseText === 'string'
                      ? req.responseText.slice(0, 2000)
                      : null,
                  response:
                    typeof req.response === 'string'
                      ? req.response.slice(0, 2000)
                      : null,
                }
              : null,
            stack: error?.stack,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.log('AXIOS_ERROR_LOG_FAILED', e);
      console.log(error);
    }
    return '';
  },
);

export default Api;

const fetcher = url => Api(url).then(res => res);

export {fetcher};
