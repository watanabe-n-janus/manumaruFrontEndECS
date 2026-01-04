/**
 * Cognito認証ユーティリティ
 * Amplifyを使わずにCognitoを直接操作
 */

export interface CognitoUser {
  username: string;
  attributes?: Record<string, string>;
}

export interface CognitoSession {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Cognito設定を取得
 */
export function getCognitoConfig() {
  const userPoolId = process.env.REACT_APP_USER_POOL_ID;
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;
  const domain = process.env.REACT_APP_COGNITO_DOMAIN;
  const region = process.env.REACT_APP_AWS_REGION || 'ap-northeast-1';
  const callbackUrl = process.env.REACT_APP_CALLBACK_URL || 'http://localhost:3000';
  const signOutUrl = process.env.REACT_APP_SIGNOUT_URL || 'http://localhost:3000';

  if (!userPoolId || !clientId || !domain) {
    throw new Error('Cognito設定が不完全です。環境変数を確認してください。');
  }

  return {
    userPoolId,
    clientId,
    domain: `${domain}.auth.${region}.amazoncognito.com`,
    region,
    callbackUrl: callbackUrl.replace(/\/$/, ''),
    signOutUrl: signOutUrl.replace(/\/$/, ''),
  };
}

/**
 * localStorageからトークンを取得
 */
export function getTokensFromStorage(): CognitoSession | null {
  const config = getCognitoConfig();
  const keyPrefix = `CognitoIdentityServiceProvider.${config.clientId}`;
  const lastAuthUser = localStorage.getItem(`${keyPrefix}.LastAuthUser`);

  if (!lastAuthUser) {
    return null;
  }

  const idToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.idToken`);
  const accessToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.accessToken`);
  const refreshToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.refreshToken`);

  if (!idToken || !accessToken) {
    return null;
  }

  return {
    idToken,
    accessToken,
    refreshToken: refreshToken || undefined,
  };
}

/**
 * トークンが有効かチェック（簡易版：有効期限をチェック）
 */
export function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // 秒からミリ秒に変換
    return Date.now() < exp;
  } catch {
    return false;
  }
}

/**
 * IDトークンからユーザー情報を取得
 */
export function getUserFromToken(idToken: string): CognitoUser {
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    
    // デバッグ: トークンのペイロードをログ出力
    console.log('🔍 getUserFromToken - Token payload keys:', Object.keys(payload));
    console.log('🔍 getUserFromToken - Email:', payload.email);
    console.log('🔍 getUserFromToken - Cognito username:', payload['cognito:username']);
    console.log('🔍 getUserFromToken - Sub:', payload.sub);
    
    // すべての属性を取得（emailを含む）
    const attributes: Record<string, string> = {};
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null) {
        attributes[key] = String(value);
      }
    });
    
    return {
      username: payload['cognito:username'] || payload.sub || 'unknown',
      attributes: {
        email: payload.email || '',
        sub: payload.sub || '',
        ...attributes,
      },
    };
  } catch (error) {
    console.error('トークンからユーザー情報を取得できませんでした:', error);
    throw new Error('無効なトークンです');
  }
}

/**
 * 現在のユーザーを取得
 */
export async function getCurrentUser(): Promise<CognitoUser> {
  console.log('👤 ユーザー情報を取得中...');
  const tokens = getTokensFromStorage();
  if (!tokens) {
    console.log('❌ トークンが見つかりません');
    throw new Error('ユーザーがログインしていません');
  }

  console.log('🔑 トークンが見つかりました:', {
    hasIdToken: !!tokens.idToken,
    hasAccessToken: !!tokens.accessToken,
    idTokenValid: isTokenValid(tokens.idToken),
  });

  if (!isTokenValid(tokens.idToken)) {
    // トークンが無効な場合はクリア
    console.log('⚠️ トークンが無効です。クリアします。');
    clearTokens();
    throw new Error('トークンの有効期限が切れています');
  }

  const user = getUserFromToken(tokens.idToken);
  console.log('✅ ユーザー情報取得成功:', user.username);
  return user;
}

/**
 * Cognito Hosted UIへのリダイレクトURLを生成
 */
export function getSignInRedirectUrl(provider?: string): string {
  const config = getCognitoConfig();
  
  // CognitoのOAuth2エンドポイントでは、scopeはスペース区切りで送信
  // URLエンコード時は%20（スペース）を使用する
  const scope = 'email openid profile';
  
  // OAuth2認可エンドポイントを使用（/oauth2/authorize）
  // これにより、認証プロバイダー選択画面が正しく表示される
  const params: string[] = [
    `client_id=${encodeURIComponent(config.clientId)}`,
    `response_type=code`,
    `scope=${encodeURIComponent(scope)}`, // encodeURIComponentでスペースが%20に変換される
    `redirect_uri=${encodeURIComponent(config.callbackUrl)}`,
  ];

  if (provider) {
    params.push(`identity_provider=${encodeURIComponent(provider)}`);
  }

  // /oauth2/authorize エンドポイントを使用（/login ではなく）
  const url = `https://${config.domain}/oauth2/authorize?${params.join('&')}`;
  console.log('🔧 生成されたリダイレクトURL:', url);
  console.log('🔧 設定確認:', {
    callbackUrl: config.callbackUrl,
    clientId: config.clientId,
    domain: config.domain,
    fullDomain: `https://${config.domain}`,
    endpoint: '/oauth2/authorize',
  });
  
  // Domain URLが正しく動作するか確認（デバッグ用）
  console.log('🔍 Domain URL確認:', {
    baseUrl: `https://${config.domain}`,
    authorizeUrl: `https://${config.domain}/oauth2/authorize`,
    expectedFormat: 'https://{domain-prefix}.auth.{region}.amazoncognito.com',
  });
  
  return url;
}

/**
 * Cognito Hosted UIにリダイレクト
 */
export function signInWithRedirect(provider?: string): void {
  const url = getSignInRedirectUrl(provider);
  console.log('🔐 Cognito Hosted UIにリダイレクト:', url);
  window.location.href = url;
}

/**
 * Cognito Hosted UIのログアウトURLを生成
 */
export function getSignOutUrl(): string {
  const config = getCognitoConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: config.signOutUrl,
  });

  return `https://${config.domain}/logout?${params.toString()}`;
}

/**
 * ログアウト
 */
export function signOut(): void {
  clearTokens();
  const url = getSignOutUrl();
  console.log('🚪 Cognito Hosted UIにログアウトリダイレクト:', url);
  window.location.href = url;
}

/**
 * localStorageからトークンをクリア
 */
export function clearTokens(): void {
  const config = getCognitoConfig();
  const keyPrefix = `CognitoIdentityServiceProvider.${config.clientId}`;
  const lastAuthUser = localStorage.getItem(`${keyPrefix}.LastAuthUser`);

  if (lastAuthUser) {
    localStorage.removeItem(`${keyPrefix}.${lastAuthUser}.idToken`);
    localStorage.removeItem(`${keyPrefix}.${lastAuthUser}.accessToken`);
    localStorage.removeItem(`${keyPrefix}.${lastAuthUser}.refreshToken`);
    localStorage.removeItem(`${keyPrefix}.${lastAuthUser}.clockDrift`);
    localStorage.removeItem(`${keyPrefix}.LastAuthUser`);
  }
}

/**
 * 認証コードをトークンに交換
 */
export async function exchangeCodeForTokens(code: string): Promise<CognitoSession> {
  const config = getCognitoConfig();
  const tokenEndpoint = `https://${config.domain}/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.callbackUrl,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `トークン交換に失敗しました: ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = `トークン交換に失敗しました: ${errorJson.error || errorText}`;
        if (errorJson.error_description) {
          errorMessage += ` - ${errorJson.error_description}`;
        }
      } catch {
        // JSONパースに失敗した場合はそのまま使用
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('🔑 トークン交換レスポンス:', {
      hasIdToken: !!data.id_token,
      hasAccessToken: !!data.access_token,
      hasRefreshToken: !!data.refresh_token,
      tokenType: data.token_type,
    });

    const tokens: CognitoSession = {
      idToken: data.id_token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };

    // トークンをlocalStorageに保存
    saveTokens(tokens);
    console.log('💾 トークンをlocalStorageに保存しました');

    return tokens;
  } catch (error) {
    console.error('トークン交換エラー:', error);
    throw error;
  }
}

/**
 * トークンをlocalStorageに保存
 */
function saveTokens(tokens: CognitoSession): void {
  const config = getCognitoConfig();
  const keyPrefix = `CognitoIdentityServiceProvider.${config.clientId}`;
  
  // トークンからユーザー名を取得
  const user = getUserFromToken(tokens.idToken);
  const username = user.username;

  console.log('💾 トークンを保存中:', {
    username,
    keyPrefix,
    hasIdToken: !!tokens.idToken,
    hasAccessToken: !!tokens.accessToken,
    hasRefreshToken: !!tokens.refreshToken,
  });

  // トークンを保存
  localStorage.setItem(`${keyPrefix}.LastAuthUser`, username);
  localStorage.setItem(`${keyPrefix}.${username}.idToken`, tokens.idToken);
  localStorage.setItem(`${keyPrefix}.${username}.accessToken`, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(`${keyPrefix}.${username}.refreshToken`, tokens.refreshToken);
  }
  localStorage.setItem(`${keyPrefix}.${username}.clockDrift`, '0');

  console.log('✅ トークン保存完了');
}

/**
 * 認証セッションを取得（Amplify互換）
 */
export async function fetchAuthSession(): Promise<{ tokens: CognitoSession | null }> {
  const tokens = getTokensFromStorage();
  return { tokens };
}

