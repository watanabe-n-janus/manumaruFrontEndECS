import React, { useState, useEffect } from "react";
import Demo from './components/Demo';
import TermsModal from './components/TermsModal';
import { AppBar, Toolbar, Box, Avatar, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { theme } from './theme';
import { UserAttributesProvider } from './contexts/UserAttributesContext';
import { signInWithRedirect, signOut as amplifySignOut, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useExternalAuth } from './hooks/useExternalAuth';

// Note: Amplify.configure is called in index.tsx to avoid duplicate configuration

function App() {
  // EW-AIからの認証トークンを処理
  useExternalAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false); // 常にfalseで初期化

  // ユーザー認証状態を確認
  useEffect(() => {
    // URLに認証コードがある場合は、認証完了を待つ
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthCode = urlParams.get('code');
    const hasError = urlParams.get('error');
    
    console.log('🔍 URL確認:', window.location.href);
    console.log('🔍 認証コード:', hasAuthCode ? '検出' : 'なし');
    console.log('🔍 エラー:', hasError || 'なし');
    if (hasError) {
      console.log('❌ エラー詳細:', urlParams.get('error_description'));
    }
    
    if (hasAuthCode) {
      console.log('🎉 認証コードを検出！認証処理を待機します...');
      setLoading(true);
      
      // 認証完了を待つ（最大30秒間、1秒ごとにリトライ）
      let attempts = 0;
      const maxAttempts = 30;
      
      const waitForAuth = setInterval(async () => {
        attempts++;
        console.log(`🔄 認証完了を確認中... (${attempts}/${maxAttempts})`);
        
        try {
          const currentUser = await getCurrentUser();
          console.log('✅ ユーザー認証成功:', currentUser.username);
          setUser(currentUser);
          setLoading(false);
          clearInterval(waitForAuth);
          // URLをクリーンアップ
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          if (attempts >= maxAttempts) {
            console.error('❌ 認証タイムアウト');
            setLoading(false);
            clearInterval(waitForAuth);
          }
        }
      }, 1000);
      
      return () => clearInterval(waitForAuth);
    } else {
      // 通常の初期チェック
      checkUser();
    }
    
    // Amplify Hubで認証イベントを監視
    const hubListener = Hub.listen('auth', async (data) => {
      console.log('🔔 Auth event:', data.payload.event);
      
      switch (data.payload.event) {
        case 'signInWithRedirect':
          console.log('🎉 リダイレクトからのサインインを検出');
          setLoading(true);
          setTimeout(() => checkUser(), 2000);
          break;
        case 'signInWithRedirect_failure':
          console.error('❌ サインイン失敗:', data.payload.data);
          setLoading(false);
          break;
        case 'tokenRefresh':
          console.log('🔄 トークンをリフレッシュしました');
          await checkUser();
          break;
        case 'customOAuthState':
          console.log('📝 OAuth state:', data.payload.data);
          setTimeout(() => checkUser(), 1000);
          break;
        default:
          console.log('📬 その他のイベント:', data.payload.event);
      }
    });
    
    return () => {
      hubListener();
    };
  }, []);

  async function checkUser() {
    try {
      console.log('👤 ユーザー情報を取得中...');
      const currentUser = await getCurrentUser();
      console.log('✅ ユーザーが見つかりました:', currentUser.username);
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      console.log('❌ ログインしていません');
      setUser(null);
      setLoading(false);
      
      // URLパラメータをチェック（バックドア用）
      const urlParams = new URLSearchParams(window.location.search);
      const loginMode = urlParams.get('login');
      
      try {
        if (loginMode === 'email') {
          // ?login=email の場合: メール/パスワード認証（バックドア）
          console.log('📧 メール認証モードでリダイレクト');
          await signInWithRedirect(); // プロバイダー指定なし = Hosted UIで選択可能
        } else {
          // 通常: PA認証のみ
          console.log('🔐 PA認証にリダイレクト');
          await signInWithRedirect({ provider: { custom: 'PA認証' } });
        }
      } catch (redirectError) {
        console.error('❌ リダイレクトエラー:', redirectError);
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
      await amplifySignOut({ global: false });
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