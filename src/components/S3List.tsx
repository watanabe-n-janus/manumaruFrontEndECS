import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/system';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { s3Client, ListObjectsV2Command } from '../hooks/awsServices';
import { theme } from '../theme';
import { useUserEmail } from '../contexts/UserAttributesContext';


interface FileInfo {
  name: string;
  lastModified: Date;
}

interface S3ListProps {
  onFileSelect: (fileName: string) => void;
  refresh: boolean;
}

const FileCard = styled(Paper)<{ selected: boolean }>(({ selected }) => ({
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  margin: `${theme.spacing.sm} 0`,
  cursor: 'pointer',
  borderRadius: theme.borderRadius.large,
  border: selected
    ? `2px solid ${theme.primary.main}`
    : '2px solid transparent',
  background: selected
    ? theme.gradients.cardHover
    : theme.gradients.card,
  boxShadow: selected
    ? theme.shadows.primary
    : theme.shadows.small,
  transition: theme.transitions.cubic,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: selected
      ? theme.shadows.primaryHover
      : theme.shadows.medium,
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.gradients.office,
    opacity: 0,
    transition: theme.transitions.default,
    pointerEvents: 'none',
  }
}));

const FileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing.sm,
});

const FileInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md,
});

const FileIcon = styled(VideoFileIcon)<{ selected: boolean }>(({ selected }) => ({
  fontSize: '24px',
  color: selected ? theme.primary.main : theme.text.secondary,
  transition: theme.transitions.default,
}));

const SelectionIcon = styled(Box)<{ selected: boolean }>(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: theme.transitions.default,
}));

const FileName = styled(Typography)<{ selected: boolean }>(({ selected }) => ({
  fontWeight: selected ? theme.fontWeight.bold : theme.fontWeight.medium,
  color: selected ? theme.text.primary : theme.text.secondary,
  fontSize: theme.typography.md,
  lineHeight: 1.4,
  transition: theme.transitions.default,
}));

const FileExtension = styled(Chip)<{ selected: boolean }>(({ selected }) => ({
  height: '20px',
  fontSize: theme.typography.xs,
  fontWeight: theme.fontWeight.bold,
  background: selected
    ? theme.gradients.primary
    : theme.gradients.card,
  color: selected ? theme.primary.contrastText : theme.text.secondary,
  '& .MuiChip-label': {
    padding: `0 ${theme.spacing.xs}`,
  }
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px',
  flexDirection: 'column',
  gap: theme.spacing.lg,
});

const EmptyState = styled(Paper)({
  padding: theme.spacing.xxl,
  textAlign: 'center',
  background: theme.gradients.card,
  border: `2px dashed ${theme.border.default}`,
  borderRadius: theme.borderRadius.large,
});

const S3List: React.FC<S3ListProps> = ({ onFileSelect, refresh }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const userEmail = useUserEmail();
  const storageUserKey = userEmail;

  // 前回のファイル名セットを保存（新規ファイル検知用）
  const previousFileNamesRef = useRef<Set<string>>(new Set());
  const lastFetchTimeRef = useRef<number>(0);

  // 新規ファイルを検知する関数
  const hasNewFiles = useCallback((newFileNames: string[], previousFileNames: Set<string>): boolean => {
    return newFileNames.some(fileName => !previousFileNames.has(fileName));
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!storageUserKey) {
      setLoading(false);
      return;
    }

    const currentTime = Date.now();

    // 短時間での連続リクエストを防ぐ（最小間隔: 2秒）
    if (currentTime - lastFetchTimeRef.current < 2000) {
      return;
    }

    lastFetchTimeRef.current = currentTime;
    setLoading(true);

    try {
      const command = new ListObjectsV2Command({
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
        Prefix: `movie/${storageUserKey}/`,
      });
      const data = await s3Client.send(command);
      const fileInfos = data.Contents
        ?.filter(item => item.Key !== 'movie/') // 'movie/'キーを除外
        .map(item => ({
          name: item.Key!.replace(`movie/${storageUserKey}/`, ''),
          lastModified: item.LastModified || new Date()
        })) || [];

      const currentFileNames = fileInfos.map(file => file.name);
      const previousFileNames = previousFileNamesRef.current;

      // ファイル一覧を更新（新規ファイルがある場合、または初回読み込みの場合）
      if (previousFileNames.size === 0 || hasNewFiles(currentFileNames, previousFileNames) || currentFileNames.length !== previousFileNames.size) {
        setFiles(fileInfos);
        previousFileNamesRef.current = new Set(currentFileNames);
      }
    } catch (error) {
      console.error('❌ Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [storageUserKey, hasNewFiles]);

  useEffect(() => {
    fetchFiles();
  }, [refresh, fetchFiles]); // refreshが変更されるたびにファイルリストを更新

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    onFileSelect(fileName);
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getFileName = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, ""); // 拡張子を除いたファイル名
  };

  const calculateDeletionDate = (createdDate: Date) => {
    const deletionDate = new Date(createdDate);
    deletionDate.setHours(deletionDate.getHours() + 25);
    deletionDate.setMinutes(0);
    deletionDate.setSeconds(0);
    deletionDate.setMilliseconds(0);
    return deletionDate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress
          size={40}
          sx={{
            color: theme.primary.main,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        <Typography variant="body2" sx={{ color: theme.text.secondary }}>
          動画ファイルを読み込み中...
        </Typography>
      </LoadingContainer>
    );
  }

  if (files.length === 0) {
    return (
      <EmptyState elevation={0}>
        <VideoFileIcon sx={{ fontSize: 48, color: theme.text.disabled, mb: 2 }} />
        <Typography variant="h6" sx={{ color: theme.text.secondary, mb: 1 }}>
          動画ファイルがありません
        </Typography>
        <Typography variant="body2" sx={{ color: theme.text.disabled }}>
          動画をアップロードしてください
        </Typography>
      </EmptyState>
    );
  }

  return (
    <Box>
      <Stack spacing={1}>
        {files.map((file, index) => {
          const fileName = file.name.replace('movie/', ''); // movie/を取り除く
          const isSelected = selectedFile === fileName;
          const fileExtension = getFileExtension(fileName);
          const fileNameOnly = getFileName(fileName);
          const createdDate = file.lastModified;
          const deletionDate = calculateDeletionDate(createdDate);

          return (
            <FileCard
              key={index}
              selected={isSelected}
              onClick={() => handleFileSelect(fileName)}
              elevation={0}
            >
              <FileHeader>
                <FileInfo>
                  <FileIcon selected={isSelected} />
                  <Box>
                    <FileName selected={isSelected}>
                      {fileNameOnly}
                    </FileName>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: theme.text.secondary }} />
                        <Typography variant="caption" sx={{ fontSize: theme.typography.xs, color: theme.text.secondary }}>
                          アップロード日時: {formatDate(createdDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 13, color: theme.status.error }} />
                        <Typography variant="caption" sx={{ fontSize: theme.typography.xs, color: theme.status.error }}>
                          削除予定日時: {formatDate(deletionDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </FileInfo>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileExtension
                    label={fileExtension}
                    size="small"
                    selected={isSelected}
                  />
                  <SelectionIcon selected={isSelected}>
                    {isSelected ? (
                      <CheckCircleIcon
                        sx={{
                          color: theme.primary.main,
                          fontSize: 20,
                          filter: `drop-shadow(0 2px 4px ${theme.alpha.primary})`
                        }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{
                          color: theme.text.disabled,
                          fontSize: 20,
                        }}
                      />
                    )}
                  </SelectionIcon>
                </Box>
              </FileHeader>
            </FileCard>
          );
        })}
      </Stack>
    </Box>
  );
};

export default S3List;