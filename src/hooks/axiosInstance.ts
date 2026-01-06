import axios from "axios";

// 開発環境では直接API Gatewayに接続（プロキシ経由だとHTTPヘッダーサイズ制限に引っかかる可能性があるため）
// 本番環境でも直接接続
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = process.env.REACT_APP_AWS_API_BASE_ENDPOINT || 
  (isDevelopment ? 'https://pq1c6g2zzi.execute-api.ap-northeast-1.amazonaws.com/Prod/' : '');
const apiKey = process.env.REACT_APP_AWS_API_KEY;

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
    // 不要なヘッダーを削除（HTTPヘッダーサイズ制限対策）
    // axiosが自動的に追加する不要なヘッダーを削除
    if (config.headers) {
      // 共通ヘッダーオブジェクトを削除
      delete (config.headers as any).common;
      delete (config.headers as any).delete;
      delete (config.headers as any).get;
      delete (config.headers as any).head;
      delete (config.headers as any).post;
      delete (config.headers as any).put;
      delete (config.headers as any).patch;
      
      // 必要最小限のヘッダーのみ保持
      const cleanHeaders: Record<string, string> = {
        'Content-Type': typeof config.headers['Content-Type'] === 'string' 
          ? config.headers['Content-Type'] 
          : 'application/json',
      };
      
      if (apiKey) {
        cleanHeaders['x-api-key'] = apiKey;
      }
      
      // 既存のカスタムヘッダーがあれば保持
      const existingApiKey = config.headers['x-api-key'];
      if (existingApiKey && typeof existingApiKey === 'string') {
        cleanHeaders['x-api-key'] = existingApiKey;
      }
      
      config.headers = cleanHeaders as any;
    }
    
    // リクエストボディのサイズをチェック
    let requestSize = 0;
    if (config.data) {
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      requestSize = new Blob([dataString]).size;
    }
    
    // HTTPヘッダーのサイズをチェック（実際のHTTPリクエストヘッダーをシミュレート）
    let headerSize = 0;
    const headerLines: string[] = [];
    Object.keys(config.headers || {}).forEach((key) => {
      const value = config.headers?.[key];
      if (value && typeof value === 'string') {
        const headerLine = `${key}: ${value}`;
        headerLines.push(headerLine);
        headerSize += new Blob([headerLine]).size + 2; // +2 for CRLF
      }
    });
    // Request line
    headerSize += new Blob([`POST ${config.url} HTTP/1.1`]).size + 2;
    
    // HTTPヘッダーサイズが大きい場合は警告（10KB制限）
    const MAX_HEADER_SIZE = 10 * 1024; // 10KB
    if (headerSize > MAX_HEADER_SIZE) {
      console.error('❌ HTTP header is too large:', {
        size: headerSize,
        sizeKB: (headerSize / 1024).toFixed(2),
        maxSizeKB: (MAX_HEADER_SIZE / 1024).toFixed(2),
        headerSizes: headerSizes,
        headerKeys: Object.keys(config.headers || {}),
      });
    }
    
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
