import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import axiosInstance from "../hooks/axiosInstance";
import { theme } from '../theme';
import { useUserEmail } from '../contexts/UserAttributesContext';

interface CreateThumbnailsProps {
  videoname: string;
  data: { video_time: string; description: string }[];
}

// ステップ1: アコーディオンヘッダーのスタイリング
const StyledAccordionSummary = styled(AccordionSummary)({
  background: theme.gradients.primary,
  color: theme.primary.contrastText,
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.primary.contrastText,
  },
});

// ステップ2: ボタンのスタイリング改善
const StyledButton = styled(Button)({
  borderRadius: theme.borderRadius.medium,
  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
  textTransform: 'none',
  fontSize: theme.typography.lg,
  fontWeight: theme.fontWeight.semibold,
  background: theme.gradients.primary,
  color: theme.primary.contrastText,
  boxShadow: theme.shadows.primary,
  transition: theme.transitions.default,
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

// ステップ3: サムネイル表示のカードレイアウト
const ThumbnailCard = styled(Card)({
  borderRadius: theme.borderRadius.large,
  overflow: 'hidden',
  background: theme.gradients.card,
  border: `1px solid ${theme.border.primaryLight}`,
  boxShadow: theme.shadows.medium,
  transition: theme.transitions.default,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.large,
    border: `1px solid ${theme.border.primary}`,
  }
});

const ThumbnailImage = styled(CardMedia)({
  height: 180,
  position: 'relative',
});

const TimeChip = styled(Chip)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: '600',
  fontSize: '12px',
  height: '24px',
  '& .MuiChip-icon': {
    color: 'white',
    fontSize: '14px',
  }
});

// ステップ4: ダイアログの改善
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
    backdropFilter: 'blur(10px)',
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontWeight: '600',
});

const CreateThumbnails: React.FC<CreateThumbnailsProps> = ({ videoname, data }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [executionArn, setExecutionArn] = useState(null);
  const accordionRef = useRef<HTMLDivElement>(null); // Ref for the Accordion
  const userEmail = useUserEmail();


  const handleCreateThumbnails = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const apiUrl = 'sf-create-thumbnail-function'
      const response = await axiosInstance.post(apiUrl, {
        videoname,
        userId: userEmail,
        data,
      });
      setExecutionArn(response.data?.executionArn);
    } catch (error) {
      console.error('POSTリクエストに失敗しました', error);
      alert('POSTリクエストに失敗しました');
    }
  };

  useEffect(() => {
    if (executionArn) {
      let pollingCount = 0;
      const maxPollingCount = 60;
      let status = 'RUNNING';
      const interval = setInterval(async () => {
        if (pollingCount >= maxPollingCount) {
          setLoading(false);
          clearInterval(interval);
          return;
        }

        const apiUrl = "get-step-function-status?executionArn=" + executionArn;
        try {
          const response = await axiosInstance.get(apiUrl);
          status = response.data?.status;
          //(JSON.stringify(response.data));
          if (status !== 'RUNNING') {
            clearInterval(interval);
            if (status === 'SUCCEEDED') {
              const _res = response.data.output;
              const result = JSON.parse(JSON.parse(_res).body);
              setResponse(result);
            } else {
            }
            setLoading(false);
            return
          }
        } catch (error) {
          console.error('Error polling Step Function status:', error);
          //setResult('Error polling Step Function status');
          clearInterval(interval);
          setLoading(false)
        }

        pollingCount++;
      }, 5000);
      return () => {
        clearInterval(interval);
      }

    }
  }, [executionArn]);


  const handleClickOpen = (image: string) => {
    setSelectedImage(image);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  return (

    <Accordion ref={accordionRef}>
      <StyledAccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <PhotoCameraIcon sx={{ fontSize: 20 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
          サムネイル作成
        </Typography>
      </StyledAccordionSummary>
      <AccordionDetails>

        <Box>
          <StyledButton
            variant="contained"
            onClick={handleCreateThumbnails}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ImageIcon />}
          >
            {loading ? 'サムネイル作成中...' : 'サムネイルを作成'}
          </StyledButton>
          {response && (
            <Box mt={3}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ImageIcon sx={{ color: '#667eea', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#374151' }}>
                  生成されたサムネイル
                </Typography>
                <Chip
                  label={`${response.data.length}個`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {response.data.map((item: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <ThumbnailCard onClick={() => handleClickOpen(item.thumbnail_url)}>
                      <ThumbnailImage
                        image={item.thumbnail_url}
                        title={`Thumbnail ${index + 1}`}
                      />
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TimeChip
                            icon={<AccessTimeIcon />}
                            label={item.video_time}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <DescriptionIcon sx={{ color: '#9ca3af', fontSize: 16, mt: 0.5 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#374151',
                              lineHeight: 1.4,
                              fontSize: '13px'
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </ThumbnailCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </AccordionDetails>
      <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <StyledDialogTitle>
          <ImageIcon />
          サムネイルの拡大表示
        </StyledDialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Selected Thumbnail"
              sx={{
                maxWidth: '50%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          )}
        </DialogContent>
      </StyledDialog>
    </Accordion>
  );
};

export default CreateThumbnails;