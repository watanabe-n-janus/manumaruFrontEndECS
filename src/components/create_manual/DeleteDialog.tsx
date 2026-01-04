import React from 'react';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { StyledDialog, StyledButton } from './styles';
import { theme } from '../../theme';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
    open,
    onClose,
    onConfirm
}) => {
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: theme.status.error }}>
                データの削除確認
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" sx={{ fontSize: theme.typography.md, color: theme.text.secondary }}>
                    本当にデータを削除してもよろしいですか？この操作は取り消すことができません。
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: `${theme.spacing.lg} ${theme.spacing.xl}`, gap: 2 }}>
                <StyledButton 
                    variant={'secondary' as any} 
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    sx={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                    キャンセル
                </StyledButton>
                <StyledButton 
                    variant={'danger' as any} 
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onConfirm();
                    }}
                    sx={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                    削除
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default DeleteDialog;
