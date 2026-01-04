// プロジェクト全体のテーマカラー定義
export const theme = {
    // メインカラー（プライマリ）- 紺色/ブルー系
    primary: {
        main: '#667eea',
        dark: '#5a67d8',
        light: '#764ba2',
        contrastText: '#ffffffff',
    },

    // セカンダリカラー - 紺色系の濃い色
    secondary: {
        main: '#764ba2',
        dark: '#6b46c1',
        light: '#667eea',
        contrastText: '#ffffff',
    },

    // グラデーション
    gradients: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primaryHover: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        primaryLight: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',

        // 機能別グラデーション
        success: 'linear-gradient(135deg, #8679fdff 0%, #62c7f7ff 100%)',
        successHover: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        info: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        infoHover: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        warningHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',

        // 背景グラデーション
        background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%)',
        card: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
        cardHover: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%)',

        // セクション別背景
        excel: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
        office: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
        progress: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
        progressBar: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

        // 特殊効果
        survey: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        html: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        htmlHover: 'linear-gradient(135deg, #0d8478 0%, #2dd36f 100%)',
    },

    // テキストカラー
    text: {
        primary: '#2c2c2c',
        secondary: '#4a5568',
        disabled: '#a0aec0',
        hint: '#718096',
        accent: '#667eea',
    },

    // 背景カラー
    background: {
        default: '#ffffff',
        paper: '#ffffff',
        disabled: '#f7fafc',
        hover: 'rgba(102, 126, 234, 0.06)',
    },

    // ボーダーカラー
    border: {
        default: '#e0e0e0',
        light: 'rgba(0,0,0,0.06)',
        primary: 'rgba(102, 126, 234, 0.3)',
        primaryLight: 'rgba(102, 126, 234, 0.15)',
        success: 'rgba(16, 185, 129, 0.2)',
        info: 'rgba(37, 99, 235, 0.3)',
    },

    // シャドウ
    shadows: {
        small: '0 2px 8px rgba(0,0,0,0.05)',
        medium: '0 4px 15px rgba(102, 126, 234, 0.12)',
        large: '0 8px 25px rgba(102, 126, 234, 0.18)',
        primary: '0 4px 15px rgba(102, 126, 234, 0.3)',
        primaryHover: '0 6px 20px rgba(102, 126, 234, 0.4)',
        success: '0 6px 20px rgba(16, 185, 129, 0.4)',
        info: '0 6px 20px rgba(37, 99, 235, 0.4)',
        warning: '0 6px 20px rgba(245, 158, 11, 0.4)',
    },

    // 状態カラー
    status: {
        success: '#ffffffff',
        successLight: '#34d399',
        successDark: '#fefeffff',
        warning: '#f59e0b',
        warningLight: '#fbbf24',
        warningDark: '#d97706',
        error: '#ef4444',
        errorLight: '#f87171',
        errorDark: '#dc2626',
        info: '#3b82f6',
        infoLight: '#60a5fa',
        infoDark: '#2563eb',
    },

    // 機能別カラー
    functional: {
        excel: '#10b981',
        excelHover: '#047857',
        word: '#2563eb',
        wordHover: '#1d4ed8',
        powerpoint: '#dc2626',
        powerpointHover: '#b91c1c',
        html: '#11998e',
        htmlHover: '#0d8478',
    },

    // 透明度付きカラー
    alpha: {
        primary: 'rgba(102, 126, 234, 0.12)',
        primaryLight: 'rgba(102, 126, 234, 0.06)',
        primaryMedium: 'rgba(102, 126, 234, 0.2)',
        white: 'rgba(255, 255, 255, 0.1)',
        whiteMedium: 'rgba(255, 255, 255, 0.2)',
        black: 'rgba(0, 0, 0, 0.1)',
        blackLight: 'rgba(0, 0, 0, 0.05)',
    },

    // アニメーション
    transitions: {
        default: 'all 0.3s ease',
        fast: 'all 0.2s ease',
        slow: 'all 0.5s ease',
        cubic: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // ボーダーラディウス
    borderRadius: {
        small: '8px',
        medium: '10px',
        large: '12px',
        xlarge: '20px',
    },

    // パディング
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
    },

    // フォントサイズ
    typography: {
        xs: '10px',
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        xxl: '20px',
    },

    // フォントウェイト
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

// 型定義
export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme;
export type PrimaryColors = keyof typeof theme.primary;
export type GradientKeys = keyof typeof theme.gradients;
export type TextColors = keyof typeof theme.text;
export type BackgroundColors = keyof typeof theme.background;
export type BorderColors = keyof typeof theme.border;
export type ShadowKeys = keyof typeof theme.shadows;
export type StatusColors = keyof typeof theme.status;
export type FunctionalColors = keyof typeof theme.functional;
export type AlphaColors = keyof typeof theme.alpha;

// ヘルパー関数
export const getGradient = (key: GradientKeys): string => theme.gradients[key];
export const getColor = (category: ThemeColors, key: string): string => {
    const categoryObj = theme[category] as Record<string, string>;
    return categoryObj[key] || '';
};
export const getAlphaColor = (key: AlphaColors): string => theme.alpha[key];
export const getShadow = (key: ShadowKeys): string => theme.shadows[key];
export const getBorderRadius = (size: keyof typeof theme.borderRadius): string => theme.borderRadius[size];
export const getSpacing = (size: keyof typeof theme.spacing): string => theme.spacing[size];
export const getTypography = (size: keyof typeof theme.typography): string => theme.typography[size];
export const getFontWeight = (weight: keyof typeof theme.fontWeight): string => theme.fontWeight[weight];
export const getTransition = (type: keyof typeof theme.transitions): string => theme.transitions[type];

// デフォルトエクスポート
export default theme;
