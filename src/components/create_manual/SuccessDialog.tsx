import React from 'react';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { StyledDialog, StyledButton } from './styles';
import { theme } from '../../theme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
    open,
    onClose,
    message
}) => {
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            aria-labelledby="success-dialog-title"
            aria-describedby="success-dialog-description"
        >
            <DialogTitle id="success-dialog-title" sx={{ fontWeight: 'bold', color: theme.status.success, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                削除完了
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="success-dialog-description" sx={{ fontSize: theme.typography.md, color: theme.text.secondary }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: `${theme.spacing.lg} ${theme.spacing.xl}`, gap: 2 }}>
                <StyledButton 
                    variant={'primary' as any} 
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    sx={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                    OK
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default SuccessDialog;
