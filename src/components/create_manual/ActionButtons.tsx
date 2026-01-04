import React from 'react';
import { CircularProgress } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { ButtonContainer, LoadingButton, StyledButton } from './styles';

interface ActionButtonsProps {
    loading: boolean;
    workContent: string;
    fileData: any;
    onCreateClick: () => void;
    onReadExistingClick: () => void;
    onDeleteClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    loading,
    workContent,
    fileData,
    onCreateClick,
    onReadExistingClick,
    onDeleteClick
}) => {
    const isDisabled = loading || !workContent.trim();
    
    return (
        <ButtonContainer>
            <LoadingButton
                variant={'primary' as any}
                onClick={() => {
                    if (!isDisabled) {
                        onCreateClick();
                    }
                }}
                disabled={isDisabled}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
            >
                {loading ? "作成中..." : "マニュアルを作成"}
            </LoadingButton>

            <StyledButton
                variant={'secondary' as any}
                onClick={onReadExistingClick}
                disabled={!fileData}
                startIcon={<FolderOpenIcon />}
            >
                既存データ読み出し
            </StyledButton>

            <StyledButton
                variant={'danger' as any}
                onClick={onDeleteClick}
                disabled={loading}
                startIcon={<DeleteIcon />}
            >
                データの削除
            </StyledButton>
        </ButtonContainer>
    );
};

export default ActionButtons;
