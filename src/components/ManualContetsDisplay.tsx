import React, { useState, useEffect } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Box,
  Paper
} from '@mui/material';
import { styled } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import ReactMarkdown from 'react-markdown';
import { theme } from '../theme';

interface ManualContetsDisplayProps {
  responseData: string;
  setResponseData: React.Dispatch<React.SetStateAction<string>>;
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

const EditContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg,
});

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isEdit',
})<{ isEdit?: boolean }>(({ isEdit }) => ({
  padding: theme.spacing.sm,
  borderRadius: theme.borderRadius.small,
  background: isEdit
    ? theme.gradients.success
    : theme.gradients.primary,
  color: theme.primary.contrastText,
  boxShadow: theme.shadows.small,
  transition: theme.transitions.default,
  '&:hover': {
    background: isEdit
      ? theme.gradients.successHover
      : theme.gradients.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows.medium,
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.borderRadius.large,
    background: theme.alpha.whiteMedium,
    '& fieldset': {
      borderColor: theme.border.primary,
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: theme.border.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: theme.typography.md,
    lineHeight: '1.6',
  }
});

const MarkdownContainer = styled(Paper)({
  padding: theme.spacing.lg,
  borderRadius: theme.borderRadius.large,
  background: theme.gradients.card,
  border: `1px solid ${theme.border.light}`,
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
  '& h1, & h2, & h3': {
    color: theme.text.primary,
    marginTop: '1.5em',
    marginBottom: '0.5em',
  },
  '& h1': {
    borderBottom: `2px solid ${theme.primary.main}`,
    paddingBottom: theme.spacing.sm,
  },
  '& p': {
    lineHeight: '1.7',
    color: theme.text.primary,
    marginBottom: '1em',
  },
  '& ul, & ol': {
    paddingLeft: '1.5em',
    '& li': {
      marginBottom: '0.5em',
      color: theme.text.primary,
    }
  },
  '& code': {
    background: theme.alpha.primary,
    padding: `2px ${theme.spacing.xs}`,
    borderRadius: theme.borderRadius.small,
    fontSize: '0.9em',
    color: theme.primary.main,
  },
  '& pre': {
    background: theme.background.paper,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.small,
    border: `1px solid ${theme.border.default}`,
    overflow: 'auto',
  }
});

const ActionLabel = styled(Typography)({
  fontSize: theme.typography.sm,
  fontWeight: theme.fontWeight.medium,
  color: theme.alpha.whiteMedium,
});

const ManualContetsDisplay: React.FC<ManualContetsDisplayProps> = ({ responseData, setResponseData }) => {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(responseData);

  useEffect(() => {
    setEditMode(responseData === '');
    setEditValue(responseData);
  }, [responseData]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    setResponseData(editValue);
    setEditMode(false);
  };

  return (
    <Box>
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="manual-content"
          id="manual-header"
        >
          <DescriptionIcon sx={{ fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
            動画から作成されたマニュアルの内容
          </Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <EditContainer>
            <StyledIconButton
              onClick={editMode ? handleSave : handleEdit}
              isEdit={editMode}
            >
              {editMode ? <SaveIcon sx={{ fontSize: 18 }} /> : <EditIcon sx={{ fontSize: 18 }} />}
            </StyledIconButton>
            <ActionLabel>
              {editMode ? '保存する' : '編集する'}
            </ActionLabel>
          </EditContainer>

          {editMode ? (
            <StyledTextField
              fullWidth
              multiline
              rows={12}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="マニュアル内容をここに入力してください..."
              variant="outlined"
            />
          ) : (
            <MarkdownContainer elevation={0}>
              <ReactMarkdown>{responseData || '*マニュアル内容がまだ生成されていません。*'}</ReactMarkdown>
            </MarkdownContainer>
          )}
        </StyledAccordionDetails>
      </StyledAccordion>
    </Box>
  );
};

export default ManualContetsDisplay;