// PALETTE DE COULEURS
export const palette = {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    danger: '#FF453A',
    warning: '#FFD60A',
    info: '#64D2FF',
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F2F2F7',
    gray200: '#E5E5EA',
    gray300: '#D1D1D6',
    gray400: '#C7C7CC',
    gray500: '#AEAEB2',
    gray600: '#8E8E93',
    gray700: '#48484A',
    gray800: '#2C2C2E',
    gray900: '#1C1C1E',
};

// THÈMES DE COULEURS
export const lightColors = {
    primary: palette.primary,
    secondary: palette.secondary,
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceLight: '#E5E5EA',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    info: palette.info,
    border: '#C6C6C8',
    white: palette.white,
    black: palette.black,
    glass: 'rgba(255, 255, 255, 0.8)',
    error: palette.danger,
};

// THÈME SOMBRE
export const darkColors = {
    primary: palette.primary,
    secondary: palette.secondary,
    background: '#000000',
    surface: '#1C1C1E',
    surfaceLight: '#2C2C2E',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    info: palette.info,
    border: '#38383A',
    white: palette.white,
    black: palette.black,
    glass: 'rgba(28, 28, 30, 0.7)',
    error: palette.danger,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
    },
    bodySmall: {
        fontSize: 14,
    },
    caption: {
        fontSize: 12,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
};

export const shadows = {
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
};

// Default export for backward compatibility during migration, defaulting to dark
export const theme = {
    colors: darkColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    dark: true,
};
