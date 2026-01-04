/**
 * postMessage用のヘルパー関数
 * iframe内から親ウィンドウに情報を送信するために使用
 */

export interface PostMessageData {
  type: string;
  data: any;
  timestamp: number;
}

/**
 * 親ウィンドウにメッセージを送信
 */
export const sendMessageToParent = (type: string, data: any) => {
  if (window.parent && window.parent !== window) {
    // iframe内で実行されている場合
    const message: PostMessageData = {
      type,
      data,
      timestamp: Date.now()
    };
    window.parent.postMessage(message, '*');
  }
};

/**
 * 選択されたファイル情報を送信
 */
export const sendSelectedFileInfo = (fileName: string | null) => {
  sendMessageToParent('FILE_SELECTED', {
    fileName: fileName || null,
    selected: fileName !== null
  });
};

/**
 * ファイルデータの状態を送信
 */
export const sendFileDataStatus = (fileData: any, status: string) => {
  sendMessageToParent('FILE_DATA_STATUS', {
    hasData: fileData !== null,
    data: fileData,
    status
  });
};

/**
 * マニュアル生成の進行状況を送信
 */
export const sendManualGenerationProgress = (progress: {
  stage: string;
  percentage: number;
  message: string;
}) => {
  sendMessageToParent('MANUAL_GENERATION_PROGRESS', progress);
};

/**
 * マニュアル生成の完了を送信
 */
export const sendManualGenerationComplete = (result: {
  success: boolean;
  data?: any;
  error?: string;
}) => {
  sendMessageToParent('MANUAL_GENERATION_COMPLETE', result);
};

/**
 * エラー情報を送信
 */
export const sendError = (error: {
  message: string;
  code?: string;
  details?: any;
}) => {
  sendMessageToParent('ERROR', error);
};

/**
 * UI状態を送信（スクロール位置、パネルサイズなど）
 */
export const sendUIState = (state: {
  leftPanelWidth?: number;
  rightPanelWidth?: number;
  scrollPosition?: number;
}) => {
  sendMessageToParent('UI_STATE', state);
};

/**
 * ユーザー情報を送信
 */
export const sendUserInfo = (user: {
  username: string;
  userId: string;
  email?: string;
}) => {
  sendMessageToParent('USER_INFO', user);
};

/**
 * 認証準備完了を送信（iframe内でEW-AIからのトークンを待つ準備ができた）
 */
export const sendAuthReady = () => {
  sendMessageToParent('AUTH_READY', {
    message: 'Ready to receive authentication tokens',
    timestamp: Date.now()
  });
};

/**
 * ページの読み込み状態を送信
 */
export const sendPageReady = () => {
  sendMessageToParent('PAGE_READY', {
    message: 'Page is ready',
    url: window.location.href,
    timestamp: Date.now()
  });
};

/**
 * ダウンロードURLを送信
 */
export const sendDownloadUrl = (data: {
  format: string;
  downloadUrl: string;
  timestamp: string;
  videoName: string;
  formatType: string;
}) => {
  sendMessageToParent('DOWNLOAD_URL_READY', data);
};

