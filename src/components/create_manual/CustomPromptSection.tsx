import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { theme } from '../../theme';

interface CustomPromptSectionProps {
    customPrompt: string;
    workContent: string;
    onEditClick: () => void;
}

const CustomPromptSection: React.FC<CustomPromptSectionProps> = ({
    customPrompt,
    workContent,
    onEditClick
}) => {
    return (
        <Box sx={{
            mb: 2,
            p: 2,
            borderRadius: theme.borderRadius.medium,
            background: theme.gradients.office,
            border: `1px solid ${theme.border.primary}`
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: theme.primary.main, fontWeight: theme.fontWeight.bold }}>
                    生成AIへのマニュアル出力内容指示
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onEditClick}
                    disabled={!workContent.trim()}
                    sx={{
                        borderColor: theme.primary.main,
                        color: theme.primary.main,
                        '&:hover': {
                            borderColor: theme.primary.dark,
                            backgroundColor: theme.alpha.primary,
                        },
                        '&:disabled': {
                            borderColor: theme.border.default,
                            color: theme.text.disabled,
                        },
                        borderRadius: theme.borderRadius.medium,
                        minWidth: '80px'
                    }}
                >
                    編集
                </Button>
            </Box>

            <TextField
                fullWidth
                multiline
                rows={5}
                value={customPrompt}
                disabled={!workContent.trim()}
                placeholder={workContent.trim() ? "作業内容と詳細レベルに基づいてプロンプトが自動生成されます" : "作業内容を入力すると、プロンプトが自動生成されます"}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: theme.borderRadius.small,
                        fontSize: theme.typography.sm,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.border.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.primary.main,
                        },
                        '&.Mui-disabled': {
                            backgroundColor: theme.background.disabled,
                        },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: theme.text.disabled,
                    },
                }}
                InputProps={{
                    readOnly: true,
                }}
            />
        </Box>
    );
};

export default CustomPromptSection;
