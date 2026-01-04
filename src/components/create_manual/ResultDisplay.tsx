import React from 'react';
import { Box, Typography, CardContent, Stack, Divider, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ResultContainer, ResultHeader } from './styles';
import { VideoTimeDescription } from './types';
import { theme } from '../../theme';

// 他のコンポーネントのインポート（実際のパスに合わせて調整）
import ManualContetsDisplay from '../ManualContetsDisplay';
import EditableTable from '../ManualTableDisplay';
import CreateThumbnails from '../CreateThumbnails';
import CreateManualPDF from '../CreateManualPDF';

interface ResultDisplayProps {
    responseData: any;
    data: VideoTimeDescription[];
    manual: string;
    fileName: string;
    onDataChange: React.Dispatch<React.SetStateAction<VideoTimeDescription[]>>;
    setManual: React.Dispatch<React.SetStateAction<string>>;
    onRetryWithReencode?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
    responseData,
    data,
    manual,
    fileName,
    onDataChange,
    setManual,
    onRetryWithReencode
}) => {
    if (!responseData) {
        return null;
    }
    const isError = responseData?.error === true;

    return (
        <ResultContainer elevation={0}>
            <ResultHeader>
                <PlayArrowIcon sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: theme.fontWeight.bold, fontSize: theme.typography.lg }}>
                    生成結果
                </Typography>
            </ResultHeader>
            <CardContent sx={{ padding: theme.spacing.xl }}>
                <Stack spacing={3}>
                    {isError && onRetryWithReencode && (
                        <Box sx={{
                            p: 2,
                            backgroundColor: theme.status.warning + '20',
                            borderRadius: theme.borderRadius.medium,
                            border: `1px solid ${theme.status.warning}`
                        }}>
                            <Typography variant="body2" sx={{ mb: 2, color: theme.text.primary }}>
                                動画形式によるエラーが発生した場合、動画形式変換モードでリトライしてください。
                                生成には通常以上の時間がかかります。
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={onRetryWithReencode}
                                sx={{
                                    backgroundColor: theme.status.warning,
                                    '&:hover': {
                                        backgroundColor: theme.status.warningDark,
                                    },
                                    color: theme.primary.contrastText,
                                }}
                            >
                                動画形式変換モード
                            </Button>
                        </Box>
                    )}

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.md, color: theme.text.primary }}>
                            動画解析データ
                        </Typography>
                        <EditableTable data={data} setData={onDataChange} />
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.md, color: theme.text.primary }}>
                            サムネイル生成
                        </Typography>
                        <CreateThumbnails videoname={fileName} data={data} />
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.md, color: theme.text.primary }}>
                            マニュアル内容
                        </Typography>
                        <ManualContetsDisplay
                            responseData={manual}
                            setResponseData={setManual}
                        />
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
                        <CreateManualPDF
                            video_name={fileName}
                            markdownText={manual}
                            thumbnailData={data}
                        />
                    </Box>
                </Stack>
            </CardContent>
        </ResultContainer>
    );
};

export default ResultDisplay;
