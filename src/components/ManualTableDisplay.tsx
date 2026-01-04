import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Snackbar,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import Alert from '@mui/material/Alert';
import { theme } from '../theme';

interface EditableTableProps {
  data: { video_time: string, description: string }[];
  setData: React.Dispatch<React.SetStateAction<{ video_time: string, description: string }[]>>;
}

const StyledAccordion = styled(Accordion)({
  borderRadius: theme.borderRadius.large,
  boxShadow: theme.shadows.medium,
  border: `1px solid ${theme.border.primaryLight}`,
  background: theme.gradients.card,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
  }
});

const StyledAccordionSummary = styled(AccordionSummary)({
  background: theme.gradients.primary,
  color: theme.primary.contrastText,
  borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`,
  minHeight: '56px',
  '&.Mui-expanded': {
    minHeight: '56px',
    borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`,
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.primary.contrastText,
    transition: theme.transitions.default,
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  }
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: theme.spacing.xl,
  background: theme.alpha.whiteMedium,
});

const AddButton = styled(Button)({
  marginBottom: theme.spacing.lg,
  borderRadius: theme.borderRadius.medium,
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  fontWeight: theme.fontWeight.semibold,
  textTransform: 'none',
  background: theme.gradients.success,
  color: theme.primary.contrastText,
  boxShadow: theme.shadows.success,
  transition: theme.transitions.default,
  '&:hover': {
    background: theme.gradients.successHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.success,
  }
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: theme.borderRadius.large,
  boxShadow: theme.shadows.small,
  border: `1px solid ${theme.border.light}`,
  overflow: 'hidden',
});

const StyledTable = styled(Table)({
  background: theme.gradients.card,
});

const StyledTableHead = styled(TableHead)({
  background: theme.gradients.card,
});

const HeaderCell = styled(TableCell)({
  fontWeight: theme.fontWeight.bold,
  color: theme.text.primary,
  fontSize: theme.typography.md,
  padding: theme.spacing.lg,
  borderBottom: `2px solid ${theme.border.primaryLight}`,
  '& .header-content': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  }
});

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== 'isEditing',
})<{ isEditing?: boolean }>(({ isEditing }) => ({
  background: isEditing
    ? theme.gradients.office
    : 'transparent',
  transition: theme.transitions.fast,
  '&:hover': {
    background: isEditing
      ? theme.gradients.office
      : theme.background.hover,
  }
}));

const StyledTableCell = styled(TableCell)({
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  borderBottom: `1px solid ${theme.border.light}`,
  color: theme.text.primary,
  fontSize: theme.typography.md,
  verticalAlign: 'middle',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.borderRadius.small,
    fontSize: theme.typography.md,
    '& fieldset': {
      borderColor: theme.border.primary,
    },
    '&:hover fieldset': {
      borderColor: theme.border.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  }
});

const ActionButton = styled(IconButton)<{ variant?: 'edit' | 'save' | 'delete' }>(({ variant = 'edit' }) => ({
  padding: theme.spacing.xs,
  borderRadius: theme.borderRadius.small,
  margin: `0 ${theme.spacing.xs}`,
  transition: theme.transitions.fast,
  ...(variant === 'edit' && {
    color: theme.primary.main,
    '&:hover': {
      background: theme.alpha.primary,
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'save' && {
    color: theme.status.success,
    '&:hover': {
      background: theme.alpha.primary,
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'delete' && {
    color: theme.status.error,
    '&:hover': {
      background: theme.alpha.primary,
      transform: 'scale(1.1)',
    }
  })
}));

const TimeDisplay = styled(Typography)({
  fontFamily: 'Monaco, "Roboto Mono", monospace',
  fontSize: theme.typography.sm,
  color: theme.primary.main,
  fontWeight: theme.fontWeight.semibold,
  background: theme.alpha.primary,
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  borderRadius: theme.borderRadius.small,
  display: 'inline-block',
});

const EditableTable: React.FC<EditableTableProps> = ({ data, setData }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<{ video_time: string, description: string }>({ video_time: '', description: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleEdit = (index: number, value: { video_time: string, description: string }) => {
    setEditIndex(index);
    setEditValue(value);
  };

  const handleSave = (index: number) => {
    const formattedTime = formatTime(editValue.video_time);
    if (formattedTime === '00:00:00' && editValue.video_time !== '00:00:00') {
      setOpenSnackbar(true);
    }
    const newData = [...data];
    newData[index] = { ...editValue, video_time: formattedTime };
    setData(newData.sort((a, b) => a.video_time.localeCompare(b.video_time)));
    setEditIndex(null);
    setEditValue({ video_time: '', description: '' });
  };

  const handleDelete = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleAdd = () => {
    const newData = [{ video_time: '', description: '' }, ...data];
    setData(newData);
    setEditIndex(0);
    setEditValue({ video_time: '', description: '' });
  };

  const formatTime = (time: string) => {
    const match = time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      return time;
    }
    return '00:00:00';
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="timeline-content"
          id="timeline-header"
        >
          <TimelineIcon sx={{ fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
            作業時系列
          </Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <AddButton
            startIcon={<AddIcon />}
            onClick={handleAdd}
            variant="contained"
          >
            新しい作業項目を追加
          </AddButton>

          <StyledTableContainer>
            <StyledTable>
              <StyledTableHead>
                <TableRow>
                  <HeaderCell>
                    <div className="header-content">
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      動画時間
                    </div>
                  </HeaderCell>
                  <HeaderCell>
                    <div className="header-content">
                      <DescriptionIcon sx={{ fontSize: 16 }} />
                      作業内容
                    </div>
                  </HeaderCell>
                  <HeaderCell>
                    <div className="header-content">
                      操作
                    </div>
                  </HeaderCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {data.map((item, index) => (
                  <StyledTableRow key={index} isEditing={editIndex === index}>
                    <StyledTableCell>
                      {editIndex === index ? (
                        <StyledTextField
                          value={editValue.video_time}
                          onChange={(e) => setEditValue({ ...editValue, video_time: e.target.value })}
                          placeholder="00:00:00"
                          size="small"
                        />
                      ) : (
                        <TimeDisplay>
                          {item.video_time || '00:00:00'}
                        </TimeDisplay>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {editIndex === index ? (
                        <StyledTextField
                          value={editValue.description}
                          onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
                          placeholder="作業内容を入力..."
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          {item.description || '未入力'}
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {editIndex === index ? (
                        <ActionButton variant="save" onClick={() => handleSave(index)}>
                          <SaveIcon sx={{ fontSize: 18 }} />
                        </ActionButton>
                      ) : (
                        <Box sx={{ display: 'flex', gap: '4px' }}>
                          <ActionButton variant="edit" onClick={() => handleEdit(index, item)}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </ActionButton>
                          <ActionButton variant="delete" onClick={() => handleDelete(index)}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </ActionButton>
                        </Box>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </StyledTable>
          </StyledTableContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ borderRadius: theme.borderRadius.small }}
        >
          時間の形式が正しくありません。00:00:00に設定されました。
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditableTable;