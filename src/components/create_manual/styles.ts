import { styled } from '@mui/system';
import { Box, Button, Card, Dialog } from '@mui/material';
import { theme } from '../../theme';

export const ButtonContainer = styled(Box)({
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xl,
});

export const StyledButton = styled(Button)<{ variant?: 'primary' | 'secondary' | 'danger' }>(({ variant = 'primary' }) => ({
    borderRadius: theme.borderRadius.large,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'none',
    fontSize: theme.typography.md,
    minWidth: '140px',
    boxShadow: 'none',
    transition: theme.transitions.cubic,
    pointerEvents: 'auto',
    cursor: 'pointer',
    zIndex: 1,
    ...(variant === 'primary' && {
        background: theme.gradients.primary,
        color: theme.primary.contrastText,
        '&:hover': {
            background: theme.gradients.primaryLight,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.primaryHover,
        },
        '&:disabled': {
            background: theme.background.disabled,
            color: theme.text.secondary,
            transform: 'none',
            boxShadow: 'none',
        }
    }),
    ...(variant === 'secondary' && {
        background: theme.gradients.card,
        color: theme.text.primary,
        border: `2px solid ${theme.border.primary}`,
        '&:hover': {
            background: theme.background.hover,
            borderColor: theme.border.primary,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.medium,
        },
        '&:disabled': {
            background: theme.background.paper,
            color: theme.text.disabled,
            borderColor: theme.border.default,
            transform: 'none',
            boxShadow: 'none',
        }
    }),
    ...(variant === 'danger' && {
        background: theme.gradients.warning,
        color: theme.primary.contrastText,
        '&:hover': {
            background: theme.gradients.warningHover,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.warning,
        },
        '&:disabled': {
            background: theme.background.disabled,
            color: theme.text.secondary,
            transform: 'none',
            boxShadow: 'none',
        }
    })
}));

export const LoadingButton = styled(StyledButton)({
    position: 'relative',
    '& .MuiCircularProgress-root': {
        marginRight: '8px',
    }
});

export const ResultContainer = styled(Card)({
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    background: theme.gradients.card,
    border: `1px solid ${theme.border.primaryLight}`,
    boxShadow: theme.shadows.large,
});

export const ResultHeader = styled(Box)({
    background: theme.gradients.primary,
    color: theme.primary.contrastText,
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    borderRadius: `${theme.borderRadius.large} ${theme.borderRadius.large} 0 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
});

export const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.sm,
        zIndex: 1300,
        pointerEvents: 'auto',
    },
    '& .MuiBackdrop-root': {
        zIndex: 1300,
    }
});
