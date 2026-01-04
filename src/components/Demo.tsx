import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Divider as MuiDivider,
  TextField,
  Grid2 as Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Button,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CreateIcon from '@mui/icons-material/Create';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useUserEmail } from '../contexts/UserAttributesContext';
import { getPresignedUrl } from '../hooks/awsServices';

import S3Uploader from './S3Uploader';
import S3List from './S3List';
import { dynamoDB, GetCommand } from '../hooks/awsServices';
import CreateManualButton from './create_manual';
import ShowSelectedData from './ShowSelectedData';
import VideoPreview from './VideoPreview';
import { theme } from '../theme';
import {
  sendPageReady,
  sendSelectedFileInfo,
  sendFileDataStatus,
  sendUIState,
  sendUserInfo,
  sendError
} from '../utils/postMessage';

const MainContainer = styled(Box)({
  minHeight: '100vh',
  background: theme.gradients.background,
  padding: theme.spacing.lg,
});

const ContentContainer = styled(Box)({
  display: 'flex',
  gap: theme.spacing.lg,
  height: 'calc(100vh - 120px)',
  maxWidth: '1600px',
  margin: '0 auto',
});

const Pane = styled(Card)<{ width: number }>(({ width }) => ({
  flex: `${width} 1 0`,
  overflow: 'auto',
  borderRadius: theme.borderRadius.large,
  boxShadow: theme.shadows.large,
  background: theme.alpha.whiteMedium,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.border.light}`,
}));

const ResizeHandle = styled(Box)({
  width: '8px',
  cursor: 'col-resize',
  background: theme.gradients.primary,
  borderRadius: theme.borderRadius.small,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: theme.transitions.default,
  '&:hover': {
    background: theme.gradients.primaryHover,
    width: '12px',
    boxShadow: theme.shadows.primaryHover,
  }
});

const SectionHeader = styled(Box)({
  background: theme.gradients.primary,
  color: theme.primary.contrastText,
  padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
  borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md,
  marginBottom: '0',
});

const SectionContent = styled(CardContent)({
  padding: theme.spacing.xl,
  '&:last-child': {
    paddingBottom: theme.spacing.xl
  }
});

const tableName = process.env.REACT_APP_DYNAMODB_TABLE_NAME;

const Demo: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(0.4);
  const [rightWidth, setRightWidth] = useState(0.6);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [refreshS3List, setRefreshS3List] = useState(false);
  const [manualLevel, setManualLevel] = useState<string>('standard');
  const [workContent, setWorkContent] = useState<string>('');
  const userEmail = useUserEmail();

  // サンプル表示用の状態
  const [showSample1, setShowSample1] = useState(false);
  const [sampleMainTab, setSampleMainTab] = useState<'usage' | 'manual'>('usage'); // 操作方法 or マニュアル生成サンプル
  const [sampleTab1, setSampleTab1] = useState<'simple' | 'standard' | 'detailed'>('standard');

  // 署名付きURLの状態
  const [sampleUrls, setSampleUrls] = useState<{
    simple: string;
    standard: string;
    detailed: string;
  }>({ simple: '', standard: '', detailed: '' });
  const [sampleVideoUrl, setSampleVideoUrl] = useState<string>('');
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string>(''); // 操作方法デモ動画

  // サンプルファイルの署名付きURLを生成
  useEffect(() => {
    const loadSampleUrls = async () => {
      const bucketName = process.env.REACT_APP_AWS_SAMPLES_BUCKET_NAME;
      if (!bucketName) {
        console.error('REACT_APP_AWS_SAMPLES_BUCKET_NAME が設定されていません');
        return;
      }

      console.log('サンプルバケット:', bucketName);

      try {
        const [simpleUrl, standardUrl, detailedUrl, videoUrl, tutorialUrl] = await Promise.all([
          getPresignedUrl(bucketName, 'samples/manual_simple.pdf'),
          getPresignedUrl(bucketName, 'samples/manual_standard.pdf'),
          getPresignedUrl(bucketName, 'samples/manual_detailed.pdf'),
          getPresignedUrl(bucketName, 'samples/sample_video.mp4'),
          getPresignedUrl(bucketName, 'samples/tutorial_video.mp4'),
        ]);

        console.log('署名付きURL生成完了:', {
          simple: simpleUrl ? '✓' : '✗',
          standard: standardUrl ? '✓' : '✗',
          detailed: detailedUrl ? '✓' : '✗',
          video: videoUrl ? '✓' : '✗',
          tutorial: tutorialUrl ? '✓' : '✗',
        });

        setSampleUrls({
          simple: simpleUrl || '',
          standard: standardUrl || '',
          detailed: detailedUrl || '',
        });
        setSampleVideoUrl(videoUrl || '');
        setTutorialVideoUrl(tutorialUrl || '');
      } catch (error) {
        console.error('サンプルファイルのURL取得エラー:', error);
      }
    };

    loadSampleUrls();
  }, []);

  // アップロード後の自動リフェッチ用
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // userEmailのデバッグログ
  useEffect(() => {
    console.log('👤 Demo component - userEmail:', userEmail);
  }, [userEmail]);

  // コンポーネントマウント時にpostMessageで準備完了を通知
  useEffect(() => {
    sendPageReady();
    if (userEmail) {
      console.log('✅ Sending user info:', userEmail);
      sendUserInfo({
        username: userEmail,
        userId: userEmail
      });
    } else {
      console.log('⚠️ userEmail is empty, not sending user info');
    }
  }, [userEmail]);

  // ファイル選択時にpostMessageで通知
  useEffect(() => {
    sendSelectedFileInfo(selectedFile);
  }, [selectedFile]);

  // ファイルデータ変更時にpostMessageで通知
  useEffect(() => {
    const status = fileData ? 'loaded' : 'empty';
    sendFileDataStatus(fileData, status);
  }, [fileData]);

  // UI状態変更時にpostMessageで通知
  useEffect(() => {
    sendUIState({
      leftPanelWidth: leftWidth,
      rightPanelWidth: rightWidth
    });
  }, [leftWidth, rightWidth]);

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleFileSelect = async (fileName: string) => {
    setSelectedFile(fileName);
    // DynamoDBからデータを取得
    const command = new GetCommand({
      TableName: tableName!,
      Key: {
        FileName: userEmail + "_" + fileName,
      },
    });

    try {
      const result = await dynamoDB.send(command);
      setFileData(result.Item);
    } catch (error) {
      console.error('Error retrieving data from DynamoDB:', error);
      sendError({
        message: 'Failed to load file data from DynamoDB',
        code: 'DYNAMODB_ERROR',
        details: error
      });
    }

  };

  const handleUploadComplete = () => {
    setRefreshS3List(prev => !prev); // S3Listを更新するためにトリガーを切り替える

    // 既存のタイマーをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 3秒後に開始、15秒後まで3秒間隔でリフェッチ（validation時間を考慮）
    timeoutRef.current = setTimeout(() => {
      // 即座に1回実行
      setRefreshS3List(prev => !prev);

      // 3秒間隔でリフェッチ（3秒、6秒、9秒、12秒、15秒後）
      intervalRef.current = setInterval(() => {
        setRefreshS3List(prev => !prev);
      }, 3000);

      // 15秒後に停止
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 12000); // 3秒後から開始して12秒間 = 15秒後まで
    }, 3000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    const startRightWidth = rightWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newLeftWidth = startLeftWidth + deltaX / window.innerWidth;
      const newRightWidth = startRightWidth - deltaX / window.innerWidth;

      // 最小幅を制限
      if (newLeftWidth >= 0.2 && newRightWidth >= 0.2) {
        setLeftWidth(newLeftWidth);
        setRightWidth(newRightWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  return (
    <MainContainer>
      {/* サンプル表示セクション */}
      <Box sx={{ maxWidth: '1600px', margin: '0 auto', mb: 3 }}>
        <Card sx={{
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.medium,
          background: theme.alpha.whiteMedium,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.border.light}`,
        }}>
          <Box
            onClick={() => setShowSample1(!showSample1)}
            sx={{
              background: theme.gradients.primary,
              color: theme.primary.contrastText,
              padding: theme.spacing.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: theme.transitions.default,
              '&:hover': {
                background: theme.gradients.primaryHover,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PlayCircleOutlineIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                マニュまる操作方法・作成マニュアルサンプルはこちらから
              </Typography>
            </Box>
            {showSample1 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          
          <Collapse in={showSample1}>
            <Box sx={{ p: 3 }}>
              {/* タブ切り替え */}
              <Tabs
                value={sampleMainTab}
                onChange={(_, newValue) => setSampleMainTab(newValue)}
                sx={{
                  mb: 3,
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    minWidth: 200,
                  }
                }}
              >
                <Tab label="マニュまる操作方法はこちら" value="usage" />
                <Tab label="作成マニュアルサンプルはこちら" value="manual" />
              </Tabs>

              {/* 操作方法タブ */}
              {sampleMainTab === 'usage' && (
                <Box>
                  <Paper sx={{
                    p: 3,
                    background: theme.alpha.whiteMedium,
                    borderRadius: theme.borderRadius.medium,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PlayCircleOutlineIcon sx={{ color: theme.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        操作方法デモ動画
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: '100%',
                      maxWidth: '800px',
                      margin: '0 auto',
                    }}>
                      {tutorialVideoUrl ? (
                        <video
                          controls
                          style={{
                            width: '100%',
                            borderRadius: theme.borderRadius.medium,
                            boxShadow: theme.shadows.medium,
                          }}
                        >
                          <source src={tutorialVideoUrl} type="video/mp4" />
                          お使いのブラウザは動画タグをサポートしていません。
                        </video>
                      ) : (
                        <Box sx={{
                          aspectRatio: '16/9',
                          background: theme.alpha.blackLight,
                          borderRadius: theme.borderRadius.medium,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px dashed ${theme.border.default}`,
                        }}>
                          <Typography sx={{ color: theme.text.secondary }}>
                            マニまるの操作方法デモ動画（読み込み中...）
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* マニュアル生成サンプルタブ */}
              {sampleMainTab === 'manual' && (
              <Grid container spacing={3}>
                {/* 左側: サンプル動画 */}
                <Grid size={{ xs: 12, md: 3.6 }}>
                  <Paper sx={{
                    p: 3,
                    height: '100%',
                    background: theme.alpha.whiteMedium,
                    borderRadius: theme.borderRadius.medium,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PlayCircleOutlineIcon sx={{ color: theme.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        サンプル動画（Excel操作）
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: theme.alpha.blackLight,
                      borderRadius: theme.borderRadius.medium,
                      overflow: 'hidden',
                    }}>
                      <video
                        controls
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      >
                        <source src={sampleVideoUrl} type="video/mp4" />
                        お使いのブラウザは動画タグをサポートしていません。
                      </video>
                    </Box>
                  </Paper>
                </Grid>

                {/* 右側: 生成マニュアル */}
                <Grid size={{ xs: 12, md: 8.4 }}>
                  <Paper sx={{
                    p: 3,
                    height: '100%',
                    background: theme.alpha.whiteMedium,
                    borderRadius: theme.borderRadius.medium,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DescriptionIcon sx={{ color: theme.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        作成マニュアルサンプル
                      </Typography>
                    </Box>

                    {/* 詳細レベル切り替えボタン */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button
                        variant={sampleTab1 === 'simple' ? 'contained' : 'outlined'}
                        onClick={() => setSampleTab1('simple')}
                        sx={{
                          minWidth: '120px',
                          py: 0.8,
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          borderRadius: theme.borderRadius.medium,
                          ...(sampleTab1 === 'simple' ? {
                            background: theme.gradients.primary,
                            '&:hover': {
                              background: theme.gradients.primaryHover,
                            }
                          } : {
                            borderColor: theme.primary.main,
                            color: theme.primary.main,
                            '&:hover': {
                              backgroundColor: theme.alpha.primaryLight,
                            }
                          })
                        }}
                      >
                        簡潔
                      </Button>
                      <Button
                        variant={sampleTab1 === 'standard' ? 'contained' : 'outlined'}
                        onClick={() => setSampleTab1('standard')}
                        sx={{
                          minWidth: '120px',
                          py: 0.8,
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          borderRadius: theme.borderRadius.medium,
                          ...(sampleTab1 === 'standard' ? {
                            background: theme.gradients.primary,
                            '&:hover': {
                              background: theme.gradients.primaryHover,
                            }
                          } : {
                            borderColor: theme.primary.main,
                            color: theme.primary.main,
                            '&:hover': {
                              backgroundColor: theme.alpha.primaryLight,
                            }
                          })
                        }}
                      >
                        標準
                      </Button>
                      <Button
                        variant={sampleTab1 === 'detailed' ? 'contained' : 'outlined'}
                        onClick={() => setSampleTab1('detailed')}
                        sx={{
                          minWidth: '140px',
                          py: 0.8,
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          borderRadius: theme.borderRadius.medium,
                          ...(sampleTab1 === 'detailed' ? {
                            background: theme.gradients.primary,
                            '&:hover': {
                              background: theme.gradients.primaryHover,
                            }
                          } : {
                            borderColor: theme.primary.main,
                            color: theme.primary.main,
                            '&:hover': {
                              backgroundColor: theme.alpha.primaryLight,
                            }
                          })
                        }}
                      >
                        詳細+補足
                      </Button>
                    </Box>

                    <Box sx={{
                      width: '100%',
                      height: '480px',
                      background: 'white',
                      borderRadius: theme.borderRadius.medium,
                      border: `1px solid ${theme.border.default}`,
                      overflow: 'hidden',
                    }}>
                      <iframe
                        src={sampleUrls[sampleTab1]}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                        title={`マニュアルサンプル（${sampleTab1 === 'simple' ? '簡潔' : sampleTab1 === 'standard' ? '標準' : '詳細+補足'}）`}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              )}
            </Box>
          </Collapse>
        </Card>
      </Box>

      <ContentContainer>
        <Pane width={leftWidth}>
          {/* 動画アップロードセクション */}
          <SectionHeader>
            <CloudUploadIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              動画アップロード
            </Typography>
          </SectionHeader>
          <SectionContent>
            <S3Uploader onUploadComplete={handleUploadComplete} />
          </SectionContent>

          <MuiDivider sx={{ mx: 3, my: 2 }} />

          {/* 動画一覧セクション */}
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VideoLibraryIcon sx={{ color: theme.primary.main, fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: theme.fontWeight.bold, color: theme.text.primary }}>
                動画一覧
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  fontSize: theme.typography.xs,
                  color: theme.text.secondary,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  px: 2
                }}
              >
                ※ 有効期限が切れたファイルは自動で削除されます
              </Typography>
            </Box>
            <S3List
              onFileSelect={handleFileSelect}
              refresh={refreshS3List}
            />

          </Box>

          {selectedFile && (
            <>
              <MuiDivider sx={{ mx: 3, my: 2 }} />
              <Box sx={{ px: 3, pb: 3 }}>
                <VideoPreview fileName={selectedFile} />
                {fileData !== undefined && (
                  <ShowSelectedData
                    loading={false}
                    data={fileData}
                  />
                )}
              </Box>
            </>
          )}
        </Pane>

        <ResizeHandle onMouseDown={handleMouseDown}>
          <DragIndicatorIcon
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              transform: 'rotate(90deg)'
            }}
          />
        </ResizeHandle>

        <Pane width={rightWidth}>
          <SectionHeader>
            <CreateIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              マニュアル作成
            </Typography>
          </SectionHeader>
          <SectionContent>
            {selectedFile ? (
              <Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: theme.borderRadius.medium,
                    background: theme.gradients.cardHover,
                    border: `1px solid ${theme.border.primary}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, color: theme.text.primary, mb: 1 }}>
                    選択されたファイル:
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.primary.main, fontWeight: theme.fontWeight.medium }}>
                    {selectedFile}
                  </Typography>
                </Paper>

                {/* マニュアルの詳細レベル選択 */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.border.primaryLight}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, color: theme.text.primary, mb: 2, fontSize: theme.typography.md }}>
                    マニュアルの詳細レベルを選択
                  </Typography>

                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={manualLevel}
                      onChange={(e) => setManualLevel(e.target.value)}
                      sx={{ gap: 2 }}
                    >
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              border: manualLevel === 'simple' ? `2px solid ${theme.primary.main}` : `1px solid ${theme.border.default}`,
                              borderRadius: theme.borderRadius.medium,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: theme.primary.main,
                                boxShadow: theme.shadows.small
                              }
                            }}
                            onClick={() => setManualLevel('simple')}
                          >
                            <FormControlLabel
                              value="simple"
                              control={<Radio sx={{ color: theme.primary.main, '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: theme.fontWeight.bold, fontSize: theme.typography.sm }}>
                                    簡潔
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', mt: 0.3, fontSize: theme.typography.xs }}>
                                    定型・簡易業務向け
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', fontSize: theme.typography.xs }}>
                                    例：申請手順書・資料作成手順書
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', margin: 0 }}
                            />
                          </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              border: manualLevel === 'standard' ? `2px solid ${theme.primary.main}` : `1px solid ${theme.border.default}`,
                              borderRadius: theme.borderRadius.medium,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: theme.primary.main,
                                boxShadow: theme.shadows.small
                              }
                            }}
                            onClick={() => setManualLevel('standard')}
                          >
                            <FormControlLabel
                              value="standard"
                              control={<Radio sx={{ color: theme.primary.main, '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: theme.fontWeight.bold, fontSize: theme.typography.sm }}>
                                    標準
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', mt: 0.3, fontSize: theme.typography.xs }}>
                                    一般作業向け
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', fontSize: theme.typography.xs }}>
                                    例：システム操作手順書・軽作業手順書
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', margin: 0 }}
                            />
                          </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              border: manualLevel === 'detailed' ? `2px solid ${theme.primary.main}` : `1px solid ${theme.border.default}`,
                              borderRadius: theme.borderRadius.medium,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: theme.primary.main,
                                boxShadow: theme.shadows.small
                              }
                            }}
                            onClick={() => setManualLevel('detailed')}
                          >
                            <FormControlLabel
                              value="detailed"
                              control={<Radio sx={{ color: theme.primary.main, '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: theme.fontWeight.bold, fontSize: theme.typography.sm }}>
                                    詳細+補足
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', mt: 0.3, fontSize: theme.typography.xs }}>
                                    安全重視・高リスク業務向け
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', fontSize: theme.typography.xs }}>
                                    例：製造手順書・品質チェック手順書
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', margin: 0 }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Paper>

                {/* 作業内容入力 */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.border.primaryLight}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, color: theme.text.primary, mb: 1.5, fontSize: theme.typography.md }}>
                    作業内容を入力してください
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    value={workContent}
                    onChange={(e) => setWorkContent(e.target.value)}
                    placeholder="作業の詳細を入力してください..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.borderRadius.medium,
                        fontSize: theme.typography.sm,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.border.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.primary.main,
                        },
                      },
                    }}
                  />
                </Paper>

                <CreateManualButton
                  fileName={selectedFile}
                  fileData={fileData}
                  onUploadComplete={handleUploadComplete}
                  manualLevel={manualLevel}
                  workContent={workContent}
                />
              </Box>
            ) : (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: theme.gradients.card,
                  border: `2px dashed ${theme.border.default}`,
                  borderRadius: theme.borderRadius.medium
                }}
              >
                <VideoLibraryIcon sx={{ fontSize: 48, color: theme.text.disabled, mb: 2 }} />
                <Typography variant="h6" sx={{ color: theme.text.secondary, mb: 1 }}>
                  動画を選択してください
                </Typography>
                <Typography variant="body2" sx={{ color: theme.text.disabled }}>
                  左側から動画ファイルを選択すると、マニュアル作成が開始できます
                </Typography>
              </Paper>
            )}
          </SectionContent>
        </Pane>
      </ContentContainer>
    </MainContainer>
  );
};

export default Demo;
