import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField,
    Button,
    Box
} from '@mui/material';
import { theme } from '../../theme';

interface CustomPromptEditModalProps {
    open: boolean;
    customPrompt: string;
    examplePrompt: string;
    onClose: () => void;
    onChange: (value: string) => void;
    onClear: () => void;
}

const CustomPromptEditModal: React.FC<CustomPromptEditModalProps> = ({
    open,
    customPrompt,
    examplePrompt,
    onClose,
    onChange,
    onClear
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{
                background: theme.gradients.primary,
                color: theme.primary.contrastText,
                borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`
            }}>
                <Typography variant="h6" sx={{ fontWeight: theme.fontWeight.bold }}>
                    生成AIへのマニュアル出力内容指示
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, color: theme.text.secondary }}>
                    <br />マニュアル出力内容指示を編集してください。<br />
                    下のヒント欄を参考に編集してください。
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder={examplePrompt}
                    value={customPrompt}
                    onChange={(e) => onChange(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: theme.borderRadius.medium,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.border.primary,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.primary.main,
                            },
                        },
                    }}
                />
                <Box sx={{ mt: 2, p: 2, borderRadius: theme.borderRadius.medium, backgroundColor: theme.alpha.primary }}>
                    <Typography variant="caption" sx={{ color: theme.primary.main, fontWeight: theme.fontWeight.bold }}>
                        💡 ヒント：
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block', mt: 0.5 }}>
                        • 対象読者のレベル（初心者、中級者、上級者）
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block' }}>
                        • 重視したい内容（安全性、効率性、詳細性など）
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.text.secondary, display: 'block' }}>
                        • 含めたい要素（図表、トラブルシューティング、注意事項など）
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                <Button
                    onClick={onClear}
                    variant="outlined"
                    sx={{
                        borderColor: theme.status.error,
                        color: theme.status.error,
                        '&:hover': {
                            borderColor: theme.status.errorDark,
                            backgroundColor: theme.alpha.primary,
                        },
                    }}
                >
                    クリア
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderColor: theme.text.secondary,
                            color: theme.text.secondary,
                            '&:hover': {
                                borderColor: theme.text.primary,
                                backgroundColor: theme.background.hover,
                            },
                        }}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="contained"
                        sx={{
                            background: theme.gradients.primary,
                            '&:hover': {
                                background: theme.gradients.primaryHover,
                            },
                        }}
                    >
                        保存
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CustomPromptEditModal;
