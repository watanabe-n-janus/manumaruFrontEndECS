import { useEffect } from 'react';

/**
 * EW-AIから受け取った認証トークンを処理するカスタムフック
 * iframe内でのSSO認証を実現
 */
export function useExternalAuth() {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // セキュリティ: 許可されたオリジンからのメッセージのみ処理
      const allowedOrigins = [
        'https://d2h1383n2c513d.cloudfront.net',  // EW-AI 本番
        'http://localhost:3000',                   // 開発環境
        'http://localhost:5173'                    // Vite開発環境
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.log('🚫 許可されていないオリジンからのメッセージを無視:', event.origin);
        return;
      }

      // EW-AI から AUTH_TOKEN を受け取った
      if (event.data?.type === 'AUTH_TOKEN') {
        const { idToken, accessToken } = event.data;
        
        console.log('🔑 EW-AIから認証トークンを受信しました');

        try {
          // Cognito User Pool IDとClient IDを取得
          const userPoolId = process.env.REACT_APP_USER_POOL_ID;
          const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;

          if (!userPoolId || !clientId) {
            throw new Error('Cognito設定が見つかりません');
          }

          // CognitoトークンをlocalStorageに保存
          const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
          const lastAuthUserKey = `${keyPrefix}.LastAuthUser`;
          
          // 現在のユーザー名を取得または生成
          let username: string;
          const existingUsername = localStorage.getItem(lastAuthUserKey);
          
          if (existingUsername) {
            username = existingUsername;
          } else {
            // トークンからユーザー名を抽出（idTokenのペイロードから）
            try {
              const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
              username = tokenPayload['cognito:username'] || tokenPayload.sub || 'external-user';
            } catch (e) {
              console.error('トークンからユーザー名を抽出できませんでした:', e);
              username = 'external-user';
            }
            localStorage.setItem(lastAuthUserKey, username);
          }

          // トークンを保存
          localStorage.setItem(`${keyPrefix}.${username}.idToken`, idToken);
          localStorage.setItem(`${keyPrefix}.${username}.accessToken`, accessToken);
          
          // clockDrift を設定（Cognitoが必要とする）
          localStorage.setItem(`${keyPrefix}.${username}.clockDrift`, '0');

          console.log('✅ Cognitoセッションを確立しました');
          
          // ページをリロードしてトークンを認識させる
          console.log('🔄 ページをリロードします...');
          window.location.reload();
          
        } catch (error) {
          console.error('❌ Cognitoセッションの確立に失敗しました:', error);
          
          // エラーを親ウィンドウに通知
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'AUTH_ERROR',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            }, event.origin);
          }
        }
      }
    };

    // メッセージリスナーを登録
    window.addEventListener('message', handleMessage);
    
    console.log('👂 EW-AIからのメッセージを待機中...');
    
    // 親ウィンドウに認証準備完了を通知
    const notifyAuthReady = () => {
      if (window.parent && window.parent !== window) {
        // iframe内で実行されている場合のみ通知
        const allowedOrigins = [
          'https://d2h1383n2c513d.cloudfront.net',
          'http://localhost:3000',
          'http://localhost:5173'
        ];
        
        // すべての許可されたオリジンに送信
        allowedOrigins.forEach(origin => {
          window.parent.postMessage(
            { type: 'AUTH_READY' },
            origin
          );
        });
        
        console.log('📢 EW-AIに認証準備完了を通知しました');
      }
    };

    // ページが完全に読み込まれてから通知
    if (document.readyState === 'complete') {
      // 既に読み込み完了している場合
      notifyAuthReady();
    } else {
      // 読み込み完了を待つ
      window.addEventListener('load', notifyAuthReady);
    }

    // クリーンアップ
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('load', notifyAuthReady);
    };
  }, []);
}
