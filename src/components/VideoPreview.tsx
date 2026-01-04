import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Fade,
  LinearProgress
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  ErrorOutline as ErrorIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { getPresignedUrl } from "../hooks/awsServices";
import { theme } from '../theme';
import { useUserEmail } from '../contexts/UserAttributesContext';

interface VideoPreviewProps {
  fileName: string;
  title?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ fileName, title = "Video Preview" }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME || "";
  const userEmail = useUserEmail();

  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = await getPresignedUrl(bucketName, "movie/" + userEmail + "/" + fileName);
        setVideoUrl(url);
      } catch (err) {
        console.error("Error fetching video URL:", err);
        setError("動画の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, [bucketName, fileName]);

  const handleVideoProgress = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(progress);
  };

  if (error) {
    return (
      <Fade in={true}>
        <Card
          elevation={3}
          sx={{
            maxWidth: 400,
            width: 'fit-content',
            margin: '0 auto',
            borderRadius: theme.borderRadius.large,
            border: `1px solid ${theme.status.error}`,
            background: theme.gradients.warning
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon sx={{ fontSize: 60, color: theme.status.error, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              エラーが発生しました
            </Typography>
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          </CardContent>
        </Card>
      </Fade>
    );
  }

  return (
    <Fade in={true}>
      <Card
        elevation={4}
        sx={{
          maxWidth: 400,
          width: 'fit-content',
          margin: '0 auto',
          borderRadius: theme.borderRadius.large,
          overflow: 'hidden',
          background: theme.gradients.background,
          border: `1px solid ${theme.border.light}`
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            background: theme.gradients.primary,
            color: theme.primary.contrastText,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <VideoIcon sx={{ fontSize: 24 }} />
          <Typography variant="subtitle1" component="h3" fontWeight="bold">
            {title}
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ p: 4 }}>
              {/* ローディングスケルトン */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: theme.primary.main,
                    mb: 2
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  動画を読み込み中...
                </Typography>
              </Box>

              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: 2 }}
              />

              <LinearProgress
                sx={{
                  mt: 2,
                  borderRadius: theme.borderRadius.small,
                  height: 6,
                  '& .MuiLinearProgress-bar': {
                    background: theme.gradients.primary
                  }
                }}
              />
            </Box>
          ) : videoUrl ? (
            <Box sx={{ position: 'relative' }}>
              {/* 動画プレビュー */}
              <Box
                sx={{
                  position: 'relative',
                  '&:hover .play-overlay': {
                    opacity: 0.8
                  }
                }}
              >
                <video
                  width="300"
                  height="auto"
                  controls
                  onTimeUpdate={handleVideoProgress}
                  style={{
                    borderRadius: theme.borderRadius.small,
                    backgroundColor: '#000',
                    display: 'block',
                    margin: `${theme.spacing.sm} auto`
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  お使いのブラウザは動画タグをサポートしていません。
                </video>

                {/* プレイオーバーレイ */}
                <Box
                  className="play-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none'
                  }}
                >
                  <PlayIcon
                    sx={{
                      fontSize: 80,
                      color: 'white',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  />
                </Box>
              </Box>

              {/* プログレスバー */}
              {videoProgress > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={videoProgress}
                  sx={{
                    height: 4,
                    backgroundColor: theme.alpha.blackLight,
                    '& .MuiLinearProgress-bar': {
                      background: theme.gradients.html
                    }
                  }}
                />
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <VideoIcon sx={{ fontSize: 60, color: theme.text.disabled, mb: 1 }} />
              <Typography variant="subtitle1" color="text.secondary">
                動画が利用できません
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                動画ファイルが見つからないか、アクセスできません
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default VideoPreview;