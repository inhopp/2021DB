import axios from 'axios';
import config from '../../package.json';

const axiosConfig = {
  headers: {
    'Cache-Control': 'no-cache',
  },
  withCredentials: true,
  baseURL: config.apiUrl
};

const instance = axios.create(axiosConfig);

export default instance;

