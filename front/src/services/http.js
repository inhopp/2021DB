import axios from 'axios';
import config from '../../package.json';

const axiosConfig = {
  headers: {
    'Cache-Control': 'no-cache',
  },
  withCredentials: true,
  baseURL: `${window.location.protocol}//${window.location.hostname}:${config.apiPort}/api`
};

const instance = axios.create(axiosConfig);

export default instance;

