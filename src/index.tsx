import React from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';

// Amplify v6 compatible configuration with SAML SSO
const config = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'ap-northeast-1_8h60Py4dr',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'YOUR_CLIENT_ID',
      identityPoolId: 'ap-northeast-1:16da2fe9-6a88-418f-a907-1bb2f323cbf2',
      loginWith: {
        oauth: {
          domain: `${process.env.REACT_APP_COGNITO_DOMAIN}.auth.ap-northeast-1.amazoncognito.com`,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [process.env.REACT_APP_CALLBACK_URL || 'https://manumaru.genai-dx.com/'],
          redirectSignOut: [process.env.REACT_APP_SIGNOUT_URL || 'https://manumaru.genai-dx.com/'],
          responseType: 'code' as const
        }
      }
    }
  }
};

// モジュールレベルでAmplifyを設定（インポート時に即座に実行）
// 2回呼び出すことで確実に設定を適用（既知の回避策）
console.log('🔧 Amplify設定:', config);
Amplify.configure(config);
Amplify.configure(config);

console.log('✅ Amplify configured');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// 少し遅延させてレンダリング
setTimeout(() => {
  root.render(<App />);
}, 0);