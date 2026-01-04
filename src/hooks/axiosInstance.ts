import axios from "axios";

// 開発環境ではプロキシ経由、本番環境では直接接続
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? '/Prod/'  // プロキシ経由（package.jsonのproxyを使用）
  : process.env.REACT_APP_AWS_API_BASE_ENDPOINT;
const apiKey = process.env.REACT_APP_AWS_API_KEY;

console.log('Axios Configuration:', {
  environment: process.env.NODE_ENV,
  isDevelopment,
  baseURL,
  apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
});

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
});

// エラー詳細をログ出力
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      fullURL: isDevelopment ? `http://localhost:3000${config.baseURL}${config.url}` : `${config.baseURL}${config.url}`,
      headers: config.headers,
    });
    return config;
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
