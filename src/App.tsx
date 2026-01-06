import React, { useState, useEffect } from "react";
import Demo from './components/Demo';
import TermsModal from './components/TermsModal';
import { AppBar, Toolbar, Box, Avatar, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { theme } from './theme';
import { UserAttributesProvider } from './contexts/UserAttributesContext';
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  exchangeCodeForTokens,
  CognitoUser
} from './utils/cognitoAuth';
import { useExternalAuth } from './hooks/useExternalAuth';

function App() {
  // EW-AIからの認証トークンを処理
  useExternalAuth();
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ユーザー認証状態を確認
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthCode = urlParams.get('code');
    const hasError = urlParams.get('error');
    const loginMode = urlParams.get('login');

    if (hasError) {
      const errorDescription = urlParams.get('error_description');
      const error = urlParams.get('error');
      console.error('❌ Cognito認証エラー:', {
        error,
        errorDescription,
        state: urlParams.get('state')
      });

      if (error === 'invalid_scope' || errorDescription === 'invalid_scope') {
        console.error('⚠️ invalid_scopeエラー: CognitoのApp Client設定を確認してください');
        console.error('   1. AWS CognitoコンソールでApp Clientを開く');
        console.error('   2. "Allowed OAuth scopes"で以下が有効になっているか確認:');
        console.error('      - email');
        console.error('      - openid');
        console.error('      - profile');
        console.error('   3. "Allowed callback URLs"に以下が登録されているか確認:');
        console.error(`      - ${process.env.REACT_APP_CALLBACK_URL || 'http://localhost:3000'}`);
      }

      if (error === 'invalid_request' || errorDescription === 'invalid_request') {
        console.error('⚠️ invalid_requestエラー: CognitoのApp Client設定を確認してください');
        console.error('   1. AWS CognitoコンソールでApp Clientを開く');
        console.error('   2. "Allowed callback URLs"に以下が登録されているか確認:');
        console.error(`      - ${process.env.REACT_APP_CALLBACK_URL || 'http://localhost:3000'}`);
        console.error('   3. URLの末尾スラッシュが設定と一致しているか確認');
      }

      setLoading(false);
      setUser(null);
      setIsRedirecting(false);
      sessionStorage.removeItem('cognito_redirecting');
      return;
    }

    // ?login=email パラメータがある場合は、リダイレクトフラグを無視して即座にリダイレクト
    if (loginMode === 'email' && !hasAuthCode) {
      sessionStorage.removeItem('cognito_redirecting');
      setIsRedirecting(true);
      sessionStorage.setItem('cognito_redirecting', 'true');

      try {
        signInWithRedirect(); // プロバイダー指定なし = Hosted UIで選択可能
      } catch (error) {
        console.error('❌ リダイレクトエラー:', error);
        setIsRedirecting(false);
        sessionStorage.removeItem('cognito_redirecting');
        setLoading(false);
      }
      return;
    }

    // リダイレクト中フラグをチェック（無限ループ防止）
    const redirectingFlag = sessionStorage.getItem('cognito_redirecting');
    if (redirectingFlag === 'true' && !hasAuthCode) {
      const checkRedirect = setInterval(() => {
        const stillRedirecting = sessionStorage.getItem('cognito_redirecting');
        if (stillRedirecting !== 'true') {
          clearInterval(checkRedirect);
          checkUser();
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkRedirect);
        sessionStorage.removeItem('cognito_redirecting');
        checkUser();
      }, 10000);

      return () => clearInterval(checkRedirect);
    }

    if (hasAuthCode) {
      sessionStorage.removeItem('cognito_redirecting');
      setLoading(true);

      exchangeCodeForTokens(hasAuthCode)
        .then(async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setLoading(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('❌ ユーザー情報取得エラー:', error);
            setLoading(false);
            setUser(null);
          }
        })
        .catch((error) => {
          console.error('❌ トークン交換エラー:', error);
          setLoading(false);
          setUser(null);
        });
      return;
    } else {
      setTimeout(() => {
        checkUser();
      }, 500);
    }
  }, [isRedirecting]);

  async function checkUser() {
    if (isRedirecting) {
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      setIsRedirecting(false);
      sessionStorage.removeItem('cognito_redirecting');
    } catch (error) {
      setUser(null);

      const redirectingFlag = sessionStorage.getItem('cognito_redirecting');
      if (redirectingFlag === 'true') {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const loginMode = urlParams.get('login');

      try {
        setIsRedirecting(true);
        sessionStorage.setItem('cognito_redirecting', 'true');

        if (loginMode === 'email') {
          signInWithRedirect();
        } else {
          signInWithRedirect('PA認証');
        }
      } catch (redirectError) {
        console.error('❌ リダイレクトエラー:', redirectError);
        setIsRedirecting(false);
        sessionStorage.removeItem('cognito_redirecting');
        setLoading(false);
      }
    }
  }

  // ログイン検出用のeffect
  useEffect(() => {
    // 削除後のリロードかチェック
    const skipTerms = sessionStorage.getItem('skipTermsAfterDelete');
    if (skipTerms === 'true') {
      // フラグを削除して注意画面をスキップ
      sessionStorage.removeItem('skipTermsAfterDelete');
      setHasAgreed(true);
      return;
    }

    if (user && !hasAgreed) {
      // ユーザーが存在し、まだ同意していない場合は利用規約を表示
      setShowTerms(true);
    }
  }, [user, hasAgreed]);

  // 利用規約に同意した時の処理
  const handleAgree = () => {
    setHasAgreed(true);
    setShowTerms(false);
    // セッション中のみ有効（ローカルストレージには保存しない）
  };

  // キャンセルした場合はログアウト
  const handleClose = async () => {
    try {
      setShowTerms(false);
      await signOut(); // Cognito Hosted UIにリダイレクト
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('❌ ログアウトエラー:', error);
      window.location.reload();
    }
  };

  // ローディング画面
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: theme.gradients.primary
        }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          認証中...
        </Typography>
      </Box>
    );
  }

  // 未認証の場合は自動的にPA認証にリダイレクトされるため、ここには到達しない
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: theme.gradients.primary
        }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          認証処理中...
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <AppBar
        position="static"
        elevation={4}
        sx={{
          background: theme.gradients.primary,
          borderRadius: `0 0 ${theme.borderRadius.large} ${theme.borderRadius.large}`,
          boxShadow: theme.shadows.primary
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 0.5, minHeight: '40px' }}>
          {/* 左側 - ユーザー情報 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: theme.alpha.whiteMedium,
                border: `1px solid ${theme.alpha.whiteMedium}`
              }}
            >
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: theme.fontWeight.bold, color: theme.primary.contrastText, fontSize: theme.typography.sm }}>
              {user ? `${user.username}さん` : 'ゲスト'}
            </Typography>
          </Box>

          {/* 右側 - リンク */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* パナソニックリンク */}
            <Chip
              icon={<BusinessIcon sx={{ fontSize: 14 }} />}
              label="パナソニック EW"
              component="a"
              href="https://panasonic.co.jp/ew/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              size="small"
              sx={{
                backgroundColor: theme.alpha.white,
                color: theme.primary.contrastText,
                border: `1px solid ${theme.alpha.whiteMedium}`,
                height: '24px',
                fontSize: theme.typography.xs,
                '&:hover': {
                  backgroundColor: theme.alpha.whiteMedium,
                },
                '& .MuiChip-icon': {
                  color: theme.primary.contrastText
                },
                textDecoration: 'none'
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Demo />

      {/* 利用規約モーダルコンポーネントを使用 */}
      <TermsModal
        isOpen={showTerms}
        onClose={handleClose}
        onAgree={handleAgree}
      />
    </div>
  );
}

// UserAttributesProviderでラップしたコンポーネント
const ThemedApp = () => (
  <UserAttributesProvider>
    <App />
  </UserAttributesProvider>
);

export default ThemedApp;