import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import { theme } from '../theme';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAgree }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.borderRadius.large,
          background: theme.gradients.background,
          boxShadow: theme.shadows.large
        }
      }}
    >
      <DialogTitle
        sx={{
          background: theme.gradients.primary,
          color: theme.primary.contrastText,
          textAlign: 'center',
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <SecurityIcon sx={{ fontSize: 28 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          注意事項（「マニュまる」利用に関して）
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            borderRadius: theme.borderRadius.medium,
            '& .MuiAlert-message': { fontSize: theme.typography.lg, fontWeight: theme.fontWeight.bold }
          }}
        >
          本サービスをご利用いただく前に、以下の注意事項を必ずお読みください
        </Alert>

        <Box sx={{ space: 2 }}>
          {/* 個人情報・秘匿情報について */}
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<InfoIcon />}
              label="個人情報・秘匿情報の取り扱い"
              color="primary"
              sx={{ mb: 2, fontWeight: 'bold' }}
            />
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 本サービスではアップロードしていただく動画に秘匿情報や個人情報が含まれる可能性があるため、<br />
              　取り扱いには十分注意してください。
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 入力できる情報は、当社に帰属するConfidentialまでとします。以下の情報は入力禁止です：
            </Typography>
            <Box sx={{ pl: 3, mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                ・個人情報（氏名、住所など）
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                ・特別管理情報（機密度の高い技術情報など）
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                ・他者の著作物（書籍、論文、記事など）
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                ・他社に関する情報（取引先情報など）
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                ・誹謗中傷やプライバシー侵害の恐れがある内容
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              上記に該当するかどうかなど、情報の取り扱いについて不明な点がある場合は、
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, pl: 2 }}>
              情報資産関連：各職場 情報セキュリティ委員
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, pl: 2 }}>
              著作権関連：リーガルセンター、担当法務、知財担当
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              　などに相談したうえで利用を行ってください。
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 出力結果の確認について */}
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<WarningIcon />}
              label="出力結果の確認・検証"
              color="warning"
              sx={{ mb: 2, fontWeight: 'bold' }}
            />
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 出力結果には生成AIによる出力のため虚偽の情報・バイアスがかかっている可能性を意識し、<br />
              　利用前に必ず確認を行ってください。<br />
              　特に、生成されたマニュアルは即座に使用せず、内容の精査を行ってください。
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 出力結果に差別・偏見・ステレオタイプなど不適切な表現、または著作権侵害等の権利侵害が含まれていないか<br />
              　確認し、リスク管理を徹底してください。
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 利用・公開について */}
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<SecurityIcon />}
              label="利用・公開時の注意"
              color="error"
              sx={{ mb: 2, fontWeight: 'bold' }}
            />
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 出力結果を利用する場合は、利用に問題がないか（利用目的や最新の社内ガイドラインを確認）、<br />
              　また不明点がある場合は担当のリーガル部門に相談してください。
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 出力結果や生成された素材を社外で使用する場合（例：成果物、公開コンテンツ等）は、<br />
              　社内手続きを明確にし、公開許可の有無を確認してください。
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* モニタリングについて */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              • 入力および出力結果は、システム的に事務局でモニタリングしております。<br />
              　不適切な利用が検知された場合、調査に必要な範囲で事務局が入力内容および出力結果を<br />
              　確認する場合がありますので、あらかじめご了承ください。
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • アップロードした動画を即座に削除する必要がある場合、本サービスの管理元へご連絡ください。
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          justifyContent: 'space-between',
          background: theme.gradients.card
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            borderColor: theme.text.secondary,
            color: theme.text.secondary,
            minWidth: 120,
            borderRadius: theme.borderRadius.medium,
            '&:hover': {
              borderColor: theme.text.primary,
              backgroundColor: theme.background.hover
            }
          }}
        >
          キャンセル
        </Button>
        <Button
          onClick={onAgree}
          variant="contained"
          size="large"
          sx={{
            background: theme.gradients.primary,
            minWidth: 120,
            borderRadius: theme.borderRadius.medium,
            boxShadow: theme.shadows.primary,
            '&:hover': {
              background: theme.gradients.primaryHover,
              boxShadow: theme.shadows.primaryHover
            }
          }}
        >
          同意して続行
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsModal;