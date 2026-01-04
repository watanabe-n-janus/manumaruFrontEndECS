import React from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { styled } from '@mui/system';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import { theme } from '../theme';

interface ShowSelectedDataProps {
  loading: boolean;
  data: {
    manual_path?: string;
    description_path?: string;
    thumbnail_html_path?: string;
  } | null;
}

const StatusContainer = styled(Paper)({
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  borderRadius: theme.borderRadius.large,
  background: theme.gradients.card,
  border: `1px solid ${theme.border.light}`,
  boxShadow: theme.shadows.small,
});

const StatusGrid = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md,
  flexWrap: 'wrap',
});

const StatusItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ completed }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs,
  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.xlarge,
  background: completed
    ? theme.gradients.success
    : theme.gradients.warning,
  border: `1px solid ${completed ? theme.border.success : theme.border.info}`,
  transition: theme.transitions.fast,
  minHeight: '32px',
  flex: '1 1 auto',
  minWidth: '120px',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: completed
      ? theme.shadows.success
      : theme.shadows.warning,
  }
}));

const StatusLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ completed }) => ({
  fontWeight: theme.fontWeight.medium,
  color: completed ? theme.status.successDark : theme.status.warningDark,
  fontSize: theme.typography.sm,
  whiteSpace: 'nowrap',
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ completed }) => ({
  height: '18px',
  fontSize: theme.typography.xs,
  fontWeight: theme.fontWeight.bold,
  background: completed
    ? theme.gradients.success
    : theme.gradients.warning,
  color: theme.primary.contrastText,
  '& .MuiChip-label': {
    padding: `0 ${theme.spacing.xs}`,
  }
}));

const HeaderText = styled(Typography)({
  fontWeight: theme.fontWeight.bold,
  color: theme.text.primary,
  fontSize: theme.typography.sm,
  marginBottom: theme.spacing.sm,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs,
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.lg,
  gap: theme.spacing.sm,
});

const ShowSelectedData: React.FC<ShowSelectedDataProps> = ({ loading, data }) => {
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress
          size={18}
          sx={{ color: theme.primary.main }}
        />
        <Typography variant="caption" sx={{ color: theme.text.secondary, fontSize: theme.typography.sm }}>
          ステータス確認中...
        </Typography>
      </LoadingContainer>
    );
  }

  if (!data) {
    return null;
  }

  const statusItems = [
    {
      key: 'manual',
      icon: <DescriptionIcon sx={{ fontSize: 16 }} />,
      label: 'マニュアル',
      completed: !!data.manual_path,
    },
    {
      key: 'analysis',
      icon: <VideoLibraryIcon sx={{ fontSize: 16 }} />,
      label: '動画解析',
      completed: !!data.description_path,
    },
    {
      key: 'thumbnail',
      icon: <ImageIcon sx={{ fontSize: 16 }} />,
      label: 'サムネイル',
      completed: !!data.thumbnail_html_path,
    },
  ];

  const completedCount = statusItems.filter(item => item.completed).length;

  return (
    <StatusContainer elevation={0}>
      <HeaderText>
        処理ステータス ({completedCount}/{statusItems.length})
      </HeaderText>
      <StatusGrid>
        {statusItems.map((item) => (
          <StatusItem key={item.key} completed={item.completed}>
            <Box sx={{ color: item.completed ? theme.status.success : theme.status.warning, display: 'flex' }}>
              {item.icon}
            </Box>
            <StatusLabel completed={item.completed}>
              {item.label}
            </StatusLabel>
            <StatusChip
              label={item.completed ? '完了' : '待機'}
              size="small"
              completed={item.completed}
            />
          </StatusItem>
        ))}
      </StatusGrid>
    </StatusContainer>
  );
};

export default ShowSelectedData;