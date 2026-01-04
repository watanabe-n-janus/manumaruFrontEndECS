import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { s3Client, ListObjectsV2Command, Upload, DeleteObjectCommand } from '../hooks/awsServices';
import { theme } from '../theme';
import { useUserEmail } from '../contexts/UserAttributesContext';

interface ReportSelectProps {
  selectedReport: string;
  handleReportChange: (event: SelectChangeEvent<string>) => void;
}

interface S3Object {
  Key: string;
  Name: string;
}

const ReportSelect: React.FC<ReportSelectProps> = ({ selectedReport, handleReportChange }) => {
  const [s3Objects, setS3Objects] = useState<S3Object[]>([]);
  const [open, setOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const userEmail = useUserEmail();

  useEffect(() => {
    const fetchS3Objects = async () => {
      const command = new ListObjectsV2Command({
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
        Prefix: 'report_form/' + userEmail + '/',
      });
      try {
        const data = await s3Client.send(command);
        const objects = data.Contents?.map(item => ({
          Key: item.Key!,
          Name: item.Key!.split('/').pop()!, // ファイル名を取得
        })) || [];
        setS3Objects(objects);
      } catch (error) {
        console.error('Error fetching S3 objects:', error);
      }
    };

    fetchS3Objects();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewFileName(event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!newFileName) return;

    const file = (document.getElementById('file-upload') as HTMLInputElement).files![0];
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
        Key: `report_form/${userEmail}/${newFileName}`,
        Body: file,
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    try {
      await upload.done();
      setS3Objects([...s3Objects, { Key: `report_form/${userEmail}/${newFileName}`, Name: newFileName }]);
      setNewFileName('');
      handleClose();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteKey) return;

    const command = new DeleteObjectCommand({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
      Key: deleteKey,
    });

    try {
      await s3Client.send(command);
      setS3Objects(s3Objects.filter(object => object.Key !== deleteKey));
      setDeleteKey(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDeleteClick = (key: string) => {
    setDeleteKey(key);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setDeleteKey(null);
  };

  return (
    <>
      <FormControl
        variant="outlined"
        sx={{
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            borderRadius: theme.borderRadius.medium,
            '& fieldset': {
              borderColor: theme.border.default,
            },
            '&:hover fieldset': {
              borderColor: theme.border.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.primary.main,
            },
          },
        }}
      >
        <InputLabel id="report-select-label">帳票選択</InputLabel>
        <Select
          labelId="report-select-label"
          id="report-select"
          value={selectedReport}
          onChange={handleReportChange}
          label="帳票選択"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {s3Objects.map((object) => (
            <MenuItem key={object.Key} value={object.Key}>
              {object.Name}
              <IconButton onClick={() => handleDeleteClick(object.Key)} size="small" style={{ marginLeft: 'auto' }}>
                <DeleteIcon />
              </IconButton>
            </MenuItem>
          ))}
          <MenuItem value="new" onClick={handleOpen}>
            <Button
              variant="contained"
              sx={{
                background: theme.gradients.primary,
                color: theme.primary.contrastText,
                borderRadius: theme.borderRadius.small,
                '&:hover': {
                  background: theme.gradients.primaryHover,
                }
              }}
            >
              新規追加
            </Button>
          </MenuItem>
        </Select>
      </FormControl>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: theme.borderRadius.large,
            background: theme.gradients.card,
          }
        }}
      >
        <DialogTitle sx={{ background: theme.gradients.primary, color: theme.primary.contrastText }}>
          新規ファイルをアップロード
        </DialogTitle>
        <DialogContent>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              borderColor: theme.text.secondary,
              color: theme.text.secondary,
              borderRadius: theme.borderRadius.small,
              '&:hover': {
                borderColor: theme.text.primary,
                backgroundColor: theme.background.hover,
              }
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleUpload}
            sx={{
              background: theme.gradients.primary,
              color: theme.primary.contrastText,
              borderRadius: theme.borderRadius.small,
              '&:hover': {
                background: theme.gradients.primaryHover,
              }
            }}
          >
            アップロード
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        PaperProps={{
          sx: {
            borderRadius: theme.borderRadius.large,
            background: theme.gradients.card,
          }
        }}
      >
        <DialogTitle sx={{ background: theme.gradients.warning, color: theme.primary.contrastText }}>
          確認
        </DialogTitle>
        <DialogContent>
          本当にこのファイルを削除しますか？
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmClose}
            sx={{
              borderColor: theme.text.secondary,
              color: theme.text.secondary,
              borderRadius: theme.borderRadius.small,
              '&:hover': {
                borderColor: theme.text.primary,
                backgroundColor: theme.background.hover,
              }
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDelete}
            sx={{
              background: theme.gradients.warning,
              color: theme.primary.contrastText,
              borderRadius: theme.borderRadius.small,
              '&:hover': {
                background: theme.gradients.warningHover,
              }
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportSelect;