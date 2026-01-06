import React, { useState, useCallback } from 'react';
import {
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Paper,
  Divider,
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Poll as SurveyIcon,
  Html as HtmlIcon,
  Close as CloseIcon,
  FileDownload as ExcelIcon,
  Description as WordIcon,
  Slideshow as PowerPointIcon
} from '@mui/icons-material';
import ReportSelect from './SelectReportForm';
import axiosInstance from "../hooks/axiosInstance";
import { theme } from '../theme';
import { sendDownloadUrl } from '../utils/postMessage';
import { useUserEmail } from '../contexts/UserAttributesContext';
import FeedbackModal, { FeedbackData } from './FeedbackModal';
import { saveFeedbackToDynamoDB } from '../hooks/awsServices';

interface CreateManualPDFProps {
  video_name: string;
  markdownText: string;
  thumbnailData: any;
}

// 非同期API用のインターフェース
interface GenerateReportRequest {
  userId: string;
  contents: string;
  videoName: string;
  thumbnailData: any[];
  reportForm?: string;
  format_type: 'word' | 'excel' | 'powerpoint';
}

interface TaskStatusResponse {
  taskId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  download_url?: string;
  error?: string;
}

// スタイリッシュなボタンコンポーネント
const StyledButton = styled(Button)({
  borderRadius: theme.borderRadius.medium,
  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
  textTransform: 'none',
  fontSize: theme.typography.lg,
  fontWeight: theme.fontWeight.semibold,
  transition: theme.transitions.default,
  boxShadow: theme.shadows.medium,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.large,
  },
});

const PrimaryButton = styled(StyledButton)({
  background: theme.gradients.primary,
  color: theme.primary.contrastText,
  '&:hover': {
    background: theme.gradients.primaryHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.primaryHover,
  },
  '&:disabled': {
    background: theme.background.disabled,
    color: theme.text.disabled,
    transform: 'none',
    boxShadow: theme.shadows.small,
  }
});

const ExcelButton = styled(StyledButton)({
  background: theme.gradients.success,
  color: theme.primary.contrastText,
  '&:hover': {
    background: theme.gradients.successHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.success,
  },
  '&:disabled': {
    background: theme.background.disabled,
    color: theme.text.disabled,
    transform: 'none',
    boxShadow: theme.shadows.small,
  }
});

const WordButton = styled(StyledButton)({
  background: theme.gradients.info,
  color: theme.primary.contrastText,
  '&:hover': {
    background: theme.gradients.infoHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.info,
  },
  '&:disabled': {
    background: theme.background.disabled,
    color: theme.text.disabled,
    transform: 'none',
    boxShadow: theme.shadows.small,
  }
});

const PowerPointButton = styled(StyledButton)({
  background: theme.gradients.warning,
  color: theme.primary.contrastText,
  '&:hover': {
    background: theme.gradients.warningHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.warning,
  },
  '&:disabled': {
    background: theme.background.disabled,
    color: theme.text.disabled,
    transform: 'none',
    boxShadow: theme.shadows.small,
  }
});

const CreateManualPDF: React.FC<CreateManualPDFProps> = ({ video_name, markdownText, thumbnailData }) => {
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [openHtml, setOpenHtml] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [openFeedback, setOpenFeedback] = useState(false);
  const [pendingAction, setPendingAction] = useState<'html' | 'word' | 'excel' | 'powerpoint' | null>(null);
  const [feedbackSubmittedForVideo, setFeedbackSubmittedForVideo] = useState<string | null>(null); // 動画ごとのフィードバック送信済みフラグ
  const [generatingState, setGeneratingState] = useState<{
    isGenerating: boolean;
    progress: string;
    taskId?: string;
    format?: string;
  }>({
    isGenerating: false,
    progress: ''
  });
  const userEmail = useUserEmail();

  // 動画が切り替わったらフィードバックフラグをリセット
  React.useEffect(() => {
    if (feedbackSubmittedForVideo !== video_name) {
      setFeedbackSubmittedForVideo(null);
    }
  }, [video_name, feedbackSubmittedForVideo]);

  // iframe内で実行されているかチェック
  const isInIframe = window.parent !== window;

  // フィードバック送信後の実際の処理実行
  const executePendingAction = async () => {
    if (pendingAction === 'html') {
      await executeCreateHTML();
    } else if (pendingAction === 'word') {
      await executeGenerateReport('word');
    } else if (pendingAction === 'excel') {
      await executeGenerateReport('excel');
    } else if (pendingAction === 'powerpoint') {
      await executeGenerateReport('powerpoint');
    }
    setPendingAction(null);
  };

  const handleCreateHTML = () => {
    // この動画で既にフィードバック送信済みの場合は直接実行
    if (feedbackSubmittedForVideo === video_name) {
      executeCreateHTML();
    } else {
      setPendingAction('html');
      setOpenFeedback(true);
    }
  };

  const getFormatTypeName = () => {
    if (pendingAction === 'html') return 'HTML/PDF';
    if (pendingAction === 'word') return 'Word';
    if (pendingAction === 'excel') return 'Excel';
    if (pendingAction === 'powerpoint') return 'PowerPoint';
    return 'ファイル';
  };

  const executeCreateHTML = async () => {
    setLoading(true);
    setHtmlContent(null);
    setOpenFeedback(false); // モーダルを閉じる
    try {
      const message = {
        markdown_text: markdownText,
        videoName: video_name,
        user_id: userEmail
      }
      const response = await axiosInstance.post('create-html', message);
      const html_url = response.data.html_url;

      let content = '';

      // html_urlからファイルをダウンロード
      if (html_url) {
        const htmlResponse = await fetch(html_url);
        content = await htmlResponse.text();
        setHtmlContent(content);
      } else if (response.data.html_content) {
        // フォールバック: html_contentが直接返された場合
        content = response.data.html_content;
        setHtmlContent(content);
      }

      // HTMLを自動的に新しいタブで開く
      if (content) {
        const blob = new Blob([new TextEncoder().encode(content)], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // blob: URLであることを検証（Open Redirect対策）
        if (url.startsWith('blob:')) {
          // iframe内でない場合のみダウンロードを実行
          if (!isInIframe) {
            window.open(url, '_blank');
          }
        }

        // postMessageで親サイトにHTMLコンテンツを送信
        sendDownloadUrl({
          format: 'HTML',
          downloadUrl: url,
          timestamp: new Date().toISOString(),
          videoName: video_name,
          formatType: 'html'
        });
      }

      setOpenHtml(true);
    } catch (error) {
      console.error('プレビュー作成に失敗しました', error);
      const errorMessage = error instanceof Error ? error.message : 'プレビュー作成に失敗しました';
      alert(`プレビュー作成に失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 1. ファイル生成を開始
  const startReportGeneration = useCallback(async (request: GenerateReportRequest): Promise<string> => {
    const response = await axiosInstance.post('generate_office_file', request);

    if (response.status !== 202) {
      throw new Error('Failed to start report generation');
    }

    return response.data.taskId;
  }, []);

  // 2. タスクのステータスを確認
  const checkTaskStatus = useCallback(async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await axiosInstance.get(`generate_office_file/status/${taskId}`);

    if (!response.data) {
      throw new Error('Failed to check task status');
    }

    return response.data;
  }, []);

  // 3. ポーリングしながら完了を待つ
  const waitForCompletion = useCallback(async (
    taskId: string,
    onProgress?: (status: TaskStatusResponse) => void,
    maxWaitTime: number = 300000, // 5分
    pollInterval: number = 3000 // 3秒
  ): Promise<string> => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await checkTaskStatus(taskId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'COMPLETED') {
        if (!status.download_url) {
          throw new Error('Download URL not found');
        }
        return status.download_url;
      }

      if (status.status === 'FAILED') {
        throw new Error(`Task failed: ${status.error}`);
      }

      // 次のポーリングまで待機
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Task timed out');
  }, [checkTaskStatus]);

  // 4. 統合: ファイル生成からダウンロードまで
  const generateAndDownloadReport = useCallback(async (
    request: GenerateReportRequest,
    onProgress?: (message: string) => void
  ): Promise<string> => {
    try {
      // ファイル生成を開始
      onProgress?.('ファイル生成を開始しています...');
      const taskId = await startReportGeneration(request);

      // 完了を待つ
      onProgress?.('ファイルを生成中です...');
      const downloadUrl = await waitForCompletion(
        taskId,
        (status) => {
          if (status.status === 'PROCESSING') {
            onProgress?.('処理中...');
          }
        }
      );

      onProgress?.('ファイル生成が完了しました！');
      return downloadUrl;

    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }, [startReportGeneration, waitForCompletion]);

  const handleGenerateOfficeFile = (formatType: 'excel' | 'word' | 'powerpoint') => {
    // Excelの場合は帳票選択が必要
    if (formatType === 'excel' && (selectedReport === '' || !selectedReport)) {
      alert('レポートを選択してください');
      return;
    }

    // この動画で既にフィードバック送信済みの場合は直接実行
    if (feedbackSubmittedForVideo === video_name) {
      executeGenerateReport(formatType);
    } else {
      setPendingAction(formatType);
      setOpenFeedback(true);
    }
  };

  const executeGenerateReport = async (formatType: 'excel' | 'word' | 'powerpoint') => {
    const formatName = formatType === 'excel' ? 'Excel' : formatType === 'word' ? 'Word' : 'PowerPoint';

    setOpenFeedback(false); // モーダルを閉じる

    setGeneratingState({
      isGenerating: true,
      progress: 'ファイル生成を開始しています...',
      format: formatName
    });

    try {
      const request: GenerateReportRequest = {
        userId: userEmail,
        contents: markdownText,
        videoName: video_name,
        thumbnailData: thumbnailData,
        format_type: formatType,
        ...(formatType === 'excel' && { reportForm: selectedReport })
      };

      const downloadUrl = await generateAndDownloadReport(
        request,
        (message) => setGeneratingState(prev => ({ ...prev, progress: message }))
      );

      // iframe内でない場合のみダウンロードを実行
      if (!isInIframe) {
        window.open(downloadUrl, '_blank')?.focus();
      }

      // postMessageで親サイトにダウンロードURLを送信
      sendDownloadUrl({
        format: formatName,
        downloadUrl: downloadUrl,
        timestamp: new Date().toISOString(),
        videoName: video_name,
        formatType: formatType
      });

    } catch (error) {
      console.error(`${formatName}作成に失敗しました`, error);
      alert(`${formatName}作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setGeneratingState({
        isGenerating: false,
        progress: ''
      });
    }
  };

  const handleCloseHtml = () => {
    setOpenHtml(false);
  };

  const handleOpenHtml = () => {
    if (!htmlContent) return;
    const blob = new Blob([new TextEncoder().encode(htmlContent)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // iframe内でない場合のみダウンロードを実行
    if (!isInIframe) {
      window.open(url, '_blank');
    }

    // postMessageで親サイトにHTMLコンテンツを送信
    sendDownloadUrl({
      format: 'HTML',
      downloadUrl: url,
      timestamp: new Date().toISOString(),
      videoName: video_name,
      formatType: 'html'
    });
  };

  const handleReportChange = (event: any) => {
    setSelectedReport(event.target.value as string);
  };

  const handleFeedbackSubmit = async (feedbackData: FeedbackData) => {
    try {
      await saveFeedbackToDynamoDB({
        ...feedbackData,
        userId: userEmail || 'anonymous'
      });
      // この動画でフィードバック送信済みとしてマーク
      setFeedbackSubmittedForVideo(video_name);
      // フィードバック送信後、保留中のアクションを実行
      await executePendingAction();
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      throw error;
    }
  };

  return (
    <Box>
      {/* ボタンを横並び */}
      <Box mt={3} sx={{ display: 'flex', gap: 4, flexWrap: 'nowrap', justifyContent: 'center' }}>
        <PrimaryButton
          variant="contained"
          onClick={handleCreateHTML}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : (
            <Box component="span" sx={{ fontSize: '6px', fontWeight: 'normal', lineHeight: 1 }}>
              HTML/PDF
            </Box>
          )}
          sx={{ 
            flex: '0 0 320px',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '14px 24px',
            minHeight: '56px'
          }}
        >
          {loading ? '作成中...' : 'プレビュー作成'}
        </PrimaryButton>
        <WordButton
          variant="contained"
          onClick={() => handleGenerateOfficeFile('word')}
          disabled={loading || generatingState.isGenerating}
          startIcon={generatingState.isGenerating && generatingState.format === 'Word' ? <CircularProgress size={24} color="inherit" /> : <WordIcon sx={{ fontSize: 28 }} />}
          sx={{ 
            flex: '0 0 320px',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '14px 24px',
            minHeight: '56px'
          }}
        >
          {generatingState.isGenerating && generatingState.format === 'Word' ? 'Word作成中...' : 'Word'}
        </WordButton>
      </Box>
      
      {/* 説明文を下に */}
      <Box mt={3}>
        <Typography variant="body2" sx={{ color: theme.text.secondary, lineHeight: 1.8, fontSize: '15px' }}>
         ※PDF出力の場合は、プレビュー作成を押下後右クリックの「印刷」から保存してください。
          <br />
         ※word出力が実行されない場合は、ブラウザのポップアップ許可設定を確認してください。
           <br />
         　各手順について詳細は操作手順書をご確認ください。
        </Typography>
      </Box>

      {/* Excel出力（帳票選択あり） */}
      {/* <Box mt={2} sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        p: 2,
        borderRadius: 2,
        background: theme.gradients.excel,
        border: `1px solid ${theme.border.success}`
      }}>
        <Typography variant="subtitle2" sx={{
          color: theme.functional.excel,
          fontWeight: 'bold',
          minWidth: 'fit-content'
        }}>
          📊 Excel出力（帳票選択）
        </Typography>
        <ReportSelect selectedReport={selectedReport} handleReportChange={handleReportChange} />
        <ExcelButton
          variant="contained"
          onClick={() => handleGenerateOfficeFile('excel')}
          disabled={loading || generatingState.isGenerating}
          startIcon={generatingState.isGenerating && generatingState.format === 'Excel' ? <CircularProgress size={20} color="inherit" /> : <ExcelIcon />}
        >
          {generatingState.isGenerating && generatingState.format === 'Excel' ? 'Excel作成中...' : 'Excel'}
        </ExcelButton>
      </Box> */}

      {/* Word・PowerPoint出力（帳票選択なし） */}
      {/* <Box mt={2} sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        p: 2,
        borderRadius: 2,
        background: theme.gradients.office,
        border: `1px solid ${theme.border.primary}`
      }}>
        <Typography variant="subtitle2" sx={{
          color: theme.primary.main,
          fontWeight: 'bold',
          minWidth: 'fit-content'
        }}>
          📄 ドキュメント出力
        </Typography>
        <WordButton
          variant="contained"
          onClick={() => handleGenerateOfficeFile('word')}
          disabled={loading || generatingState.isGenerating}
          startIcon={generatingState.isGenerating && generatingState.format === 'Word' ? <CircularProgress size={20} color="inherit" /> : <WordIcon />}
        >
          {generatingState.isGenerating && generatingState.format === 'Word' ? 'Word作成中...' : 'Word'}
        </WordButton>
        <PowerPointButton
          variant="contained"
          onClick={() => handleGenerateOfficeFile('powerpoint')}
          disabled={loading || generatingState.isGenerating}
          startIcon={generatingState.isGenerating && generatingState.format === 'PowerPoint' ? <CircularProgress size={20} color="inherit" /> : <PowerPointIcon />}
        >
          {generatingState.isGenerating && generatingState.format === 'PowerPoint' ? 'PowerPoint作成中...' : 'PowerPoint'}
        </PowerPointButton>
      </Box> */}

      {/* Officeファイル生成の進行状況表示 */}
      {generatingState.isGenerating && (
        <Box mt={2}>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(30, 136, 229, 0.1) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.3)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {generatingState.format}ファイルを生成中です...
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {generatingState.progress}
                </Typography>
                <LinearProgress
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #2196f3 0%, #1e88e5 100%)'
                    }
                  }}
                />
              </Box>
            </Box>
          </Alert>
        </Box>
      )}

      {htmlContent && (
        <Dialog open={openHtml} onClose={handleCloseHtml} maxWidth="lg" fullWidth>
          <Paper elevation={4} sx={{ borderRadius: 3 }}>
            <DialogTitle sx={{
              textAlign: 'center',
              pb: 1,
              background: theme.gradients.primary,
              color: theme.primary.contrastText,
              borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`,
              position: 'relative'
            }}>
              <IconButton
                onClick={handleCloseHtml}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <CloseIcon />
              </IconButton>
              <HtmlIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
              <Typography variant="h5" component="div" fontWeight="bold">
                HTMLプレビュー
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                HTML/PDFの生成が完了しました
              </Typography>
            </DialogContent>
          </Paper>
        </Dialog>
      )}

      {/* フィードバックモーダル */}
      <FeedbackModal
        open={openFeedback}
        onClose={() => setOpenFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        formatType={getFormatTypeName()}
      />
    </Box>
  );
};

export default CreateManualPDF;
