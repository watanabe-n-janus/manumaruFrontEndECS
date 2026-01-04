import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  styled,
  Divider,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import StarIcon from '@mui/icons-material/Star';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: '#1976d2',
  },
  '& .MuiRating-iconHover': {
    color: '#1565c0',
  },
  '& .MuiRating-icon': {
    fontSize: '2rem',
  },
}));

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackData) => Promise<void>;
  formatType?: string; // 'HTML/PDF', 'Word', 'Excel', 'PowerPoint'
}

export interface FeedbackData {
  rating: number;
  timeSaved: string;
  comment: string;
  timestamp: string;
  userId?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose, onSubmit, formatType = 'ファイル' }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [timeSaved, setTimeSaved] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === null || rating === 0) {
      alert('満足度を選択してください');
      return;
    }

    if (!timeSaved) {
      alert('削減時間を入力してください');
      return;
    }

    const timeSavedNum = parseFloat(timeSaved);
    if (isNaN(timeSavedNum) || timeSavedNum < 0) {
      alert('削減時間は正の数値を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        rating,
        timeSaved,
        comment,
        timestamp: new Date().toISOString(),
      };

      await onSubmit(feedbackData);
      
      // リセット
      setRating(0);
      setTimeSaved('');
      setComment('');
      onClose();
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      alert('フィードバックの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // モーダルを閉じずに必須項目の入力を促す
    alert('満足度と想定削減時間を入力してください');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleSkip} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Transition}
    >
      <DialogTitle>
        <Box sx={{ textAlign: 'center', pt: 2, pb: 2 }}>
          <FeedbackIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 1 }}>
            ご利用ありがとうございます
          </Typography>
          <Typography variant="body2" color="text.secondary">
            サービス向上のため、ご意見をお聞かせください
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* 満足度 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StarIcon sx={{ color: '#1976d2', fontSize: 24 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                満足度 <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 1 }}>
              <StyledRating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                precision={1}
                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
              />
            </Box>
            {rating !== null && rating > 0 && (
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#1976d2',
                }}
              >
                {rating} / 5
              </Typography>
            )}
          </Box>

          <Divider />

          {/* 削減時間 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 24 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                想定削減時間（時間） <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="number"
              value={timeSaved}
              onChange={(e) => setTimeSaved(e.target.value)}
              placeholder="例: 2.5"
              inputProps={{
                step: 0.1,
                min: 0,
              }}
              helperText="半角数値で入力してください（例: 1時間30分 → 1.5）"
            />
          </Box>

          <Divider />

          {/* フリーコメント */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CommentIcon sx={{ color: '#1976d2', fontSize: 24 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                コメント（任意）
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ご意見・ご要望などをお聞かせください"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? null : <SendIcon />}
          fullWidth
          sx={{
            textTransform: 'none',
            py: 1.5,
          }}
        >
          {isSubmitting ? '送信中...' : `送信（送信後、${formatType}が生成されます）`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
