import React, { useRef, useState, useCallback } from "react";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Fade,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { s3Client, Upload } from '../hooks/awsServices';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { theme } from '../theme';
import { useUserEmail } from '../contexts/UserAttributesContext';

interface S3UploaderProps {
  onUploadComplete: () => void;
}

const S3Uploader: React.FC<S3UploaderProps> = ({ onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userEmail = useUserEmail();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'size_error' | 'warning'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
  const COMPRESS_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('video/')) {
      setErrorMessage('動画ファイルを選択してください。');
      setUploadStatus('error');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`ファイルサイズが上限（2GB）を超えています。現在のサイズ: ${formatFileSize(file.size)}
        ファイルサイズを2GB以下にしてください。
      `);
      setUploadStatus('size_error');
      return false;
    }
    return true;
  };

  const handleConfirmUpload = async () => {
    if (pendingFile) {
      setSelectedFile(pendingFile);
      setWarningMessage('');
      setUploadStatus('idle');
      await uploadFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleCancelUpload = () => {
    setPendingFile(null);
    setWarningMessage('');
    setUploadStatus('idle');
    setErrorMessage('');
  };
  const uploadFile = useCallback(async (file: File) => {
    const storageUserKey = userEmail;

    setLoading(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      console.log('🔑 Uploading with credentials check...');
      console.log('Bucket:', process.env.REACT_APP_AWS_BUCKET_NAME);
      console.log('Region:', process.env.REACT_APP_AWS_REGION);
      console.log('Access Key exists:', !!process.env.REACT_APP_AWS_ACCESS_KEY_ID);
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
          Key: `trunk/${storageUserKey}/${file.name}`,
          Body: file,
          ContentType: file.type,
        },
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        // チェックサムを完全に無効化
        leavePartsOnError: false,
      });

      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          setUploadProgress(percentage);
        }
      });

      await upload.done();
      setUploadStatus('success');
      onUploadComplete();
      
      // 2秒後にボタンを再活性化
      setTimeout(() => {
        setUploadStatus('idle');
        setSelectedFile(null);
      }, 2000);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setUploadStatus('error');
      setErrorMessage('アップロード中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [userEmail, onUploadComplete]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        await uploadFile(file);
      }
    }
  };

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        await uploadFile(file);
      }
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
        {loading ? (
        <Box sx={{ textAlign: 'center', minWidth: 200 }}>
          <Button
            variant="contained"
            disabled
            sx={{
              backgroundColor: theme.background.disabled,
              color: theme.text.disabled,
              px: 3,
              py: 1,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.sm,
              minHeight: 'auto',
              height: '36px'
            }}
          >
            <CircularProgress size={16} sx={{ mr: 1 }} />
            アップロード中 {uploadProgress}%
          </Button>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              width: '100%',
              height: 3,
              borderRadius: theme.borderRadius.small,
              mt: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.primary.main
              }
            }}
          />
        </Box>
      ) : uploadStatus === 'success' ? (
        <Button
          variant="contained"
          disabled
          sx={{
            backgroundColor: theme.status.success,
            color: theme.primary.contrastText,
            px: 3,
            py: 1,
            borderRadius: theme.borderRadius.small,
            fontSize: theme.typography.sm,
            minHeight: 'auto',
            height: '36px'
          }}
        >
          <CheckIcon sx={{ fontSize: 16, mr: 1 }} />
          アップロード完了！
        </Button>
      ) : uploadStatus === 'error' ? (
        <Button
          variant="contained"
          onClick={handleButtonClick}
          sx={{
            backgroundColor: theme.status.error,
            '&:hover': {
              backgroundColor: theme.status.errorDark,
            },
            color: theme.primary.contrastText,
            px: 3,
            py: 1,
            borderRadius: theme.borderRadius.small,
            fontSize: theme.typography.sm,
            minHeight: 'auto',
            height: '36px'
          }}
        >
          <ErrorIcon sx={{ fontSize: 16, mr: 1 }} />
          再アップロード
        </Button>
      ) : uploadStatus === 'size_error' ? (
        <Button
          variant="contained"
          onClick={handleButtonClick}
          sx={{
            backgroundColor: theme.status.warning,
            '&:hover': {
              backgroundColor: theme.status.warningDark,
            },
            color: theme.primary.contrastText,
            px: 3,
            py: 1,
            borderRadius: theme.borderRadius.small,
            fontSize: theme.typography.sm,
            minHeight: 'auto',
            height: '36px'
          }}
        >
          <ErrorIcon sx={{ fontSize: 16, mr: 1 }} />
          ファイルサイズ超過
        </Button>
      ) : uploadStatus === 'warning' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleConfirmUpload}
            sx={{
              backgroundColor: theme.status.warning,
              '&:hover': {
                backgroundColor: theme.status.warningDark,
              },
              color: theme.primary.contrastText,
              px: 3,
              py: 1,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.sm,
              minHeight: 'auto',
              height: '36px'
            }}
          >
            <WarningIcon sx={{ fontSize: 16, mr: 1 }} />
            アップロードを続行
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancelUpload}
            sx={{
              borderColor: theme.text.secondary,
              color: theme.text.secondary,
              '&:hover': {
                borderColor: theme.text.primary,
                backgroundColor: theme.background.hover,
              },
              px: 3,
              py: 1,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.sm,
              minHeight: 'auto',
              height: '36px'
            }}
          >
            キャンセル
          </Button>
        </Box>
      ) : (
        <>
          <Button
            variant="contained"
            onClick={handleButtonClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              backgroundColor: dragOver ? theme.primary.dark : theme.primary.main,
              '&:hover': {
                backgroundColor: theme.primary.dark,
              },
              px: 3,
              py: 1.5,
              borderRadius: theme.borderRadius.small,
              fontSize: '16px',
              fontWeight: 500,
              minHeight: 'auto',
              height: '44px'
            }}
          >
            <UploadIcon sx={{ fontSize: 20, mr: 1 }} />
            {dragOver ? 'ドロップしてください' : '動画アップロード'}
          </Button>
          
          <Button
            variant="outlined"
            type="button"
            onClick={async () => {
              try {
                const bucketName = process.env.REACT_APP_AWS_SAMPLES_BUCKET_NAME;
                if (!bucketName) {
                  console.error('サンプルバケット名が設定されていません');
                  return;
                }
                
                const command = new GetObjectCommand({
                  Bucket: bucketName,
                  Key: 'samples/How_to_Record_Videos.pdf',
                });
                
                const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                setPdfUrl(signedUrl);
                setPdfModalOpen(true);
              } catch (error) {
                console.error('PDFを開けませんでした:', error);
              }
            }}
            sx={{
              borderColor: theme.primary.main,
              color: theme.primary.main,
              '&:hover': {
                borderColor: theme.primary.dark,
                backgroundColor: theme.background.hover,
              },
              px: 2,
              py: 1.5,
              borderRadius: theme.borderRadius.small,
              fontSize: '16px',
              fontWeight: 500,
              minHeight: 'auto',
              height: '44px',
              whiteSpace: 'nowrap'
            }}
          >
            <DescriptionIcon sx={{ fontSize: 20, mr: 0.5 }} />
            動画撮影のコツはこちら
          </Button>
        </>
      )}
      </Box>

      {/* エラーメッセージ */}
      {errorMessage && (
        <Fade in={true}>
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontSize: theme.typography.xs }}>
            {errorMessage}
          </Typography>
        </Fade>
      )}

      {/* 警告メッセージ */}
      {warningMessage && (
        <Fade in={true}>
          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', fontSize: theme.typography.xs }}>
            {warningMessage}
          </Typography>
        </Fade>
      )}

      {/* 選択されたファイル情報 */}
      {selectedFile && uploadStatus === 'idle' && (
        <Fade in={true}>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: theme.typography.xs }}>
            {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </Typography>
        </Fade>
      )}
    </Box>

    {/* PDF表示モーダル */}
    <Dialog
      open={pdfModalOpen}
      onClose={() => setPdfModalOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        動画撮影のコツ
        <IconButton
          aria-label="close"
          onClick={() => setPdfModalOpen(false)}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: '100%' }}>
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="動画撮影のコツ"
        />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default S3Uploader;