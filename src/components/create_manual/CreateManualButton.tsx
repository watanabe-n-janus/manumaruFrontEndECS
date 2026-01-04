import React from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { CreateManualButtonProps } from './types';
import { useCreateManual } from './hooks/useCreateManual';
import CustomPromptSection from './CustomPromptSection';
import ActionButtons from './ActionButtons';
import DeleteDialog from './DeleteDialog';
import SuccessDialog from './SuccessDialog';
import CustomPromptEditModal from './CustomPromptEditModal';
import ResultDisplay from './ResultDisplay';

const CreateManualButton: React.FC<CreateManualButtonProps> = ({
    fileName,
    fileData,
    onUploadComplete,
    manualLevel = 'standard',
    workContent = '',
}) => {
    const {
        loading,
        responseData,
        data,
        manual,
        deleteOpen,
        successDialogOpen,
        customPrompt,
        customPromptModalOpen,
        example_prompt,
        snackbarOpen,
        snackbarMessage,
        snackbarSeverity,
        handleClick,
        handleRetryWithReencode,
        handleReadExistingData,
        handleDeleteClickOpen,
        handleDeleteClose,
        handleDeleteData,
        handleDataChange,
        handleSnackbarClose,
        setManual,
        setCustomPrompt,
        setCustomPromptModalOpen,
        setSuccessDialogOpen,
    } = useCreateManual(fileName, fileData, manualLevel, workContent, onUploadComplete);

    return (
        <Box>
            <CustomPromptSection
                customPrompt={customPrompt}
                workContent={workContent}
                onEditClick={() => setCustomPromptModalOpen(true)}
            />

            <ActionButtons
                loading={loading}
                workContent={workContent}
                fileData={fileData}
                onCreateClick={handleClick}
                onReadExistingClick={handleReadExistingData}
                onDeleteClick={handleDeleteClickOpen}
            />

            <DeleteDialog
                open={deleteOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteData}
            />

            <SuccessDialog
                open={successDialogOpen}
                onClose={() => setSuccessDialogOpen(false)}
                message="データを削除しました。"
            />

            <CustomPromptEditModal
                open={customPromptModalOpen}
                customPrompt={customPrompt}
                examplePrompt={example_prompt}
                onClose={() => setCustomPromptModalOpen(false)}
                onChange={setCustomPrompt}
                onClear={() => {
                    setCustomPrompt('');
                    setCustomPromptModalOpen(false);
                }}
            />

            <ResultDisplay
                responseData={responseData}
                data={data}
                manual={manual}
                fileName={fileName || ''}
                onDataChange={handleDataChange}
                setManual={setManual}
                onRetryWithReencode={handleRetryWithReencode}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={snackbarSeverity === 'success' ? 3000 : 6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ 
                        width: '100%',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        ...(snackbarSeverity === 'success' && {
                            backgroundColor: '#4caf50',
                            color: 'white',
                        })
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateManualButton;
