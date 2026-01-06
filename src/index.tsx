import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { getCognitoConfig } from './utils/cognitoAuth';

// Cognito設定を確認
try {
  getCognitoConfig();
} catch (error) {
  console.error('❌ Cognito設定エラー:', error);
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// 少し遅延させてレンダリング
setTimeout(() => {
  root.render(<App />);
}, 0);