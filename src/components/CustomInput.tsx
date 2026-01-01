import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, Pressable, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Définition de l'interface TypeScript pour les propriétés du composant.
interface CustomInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    inputWrapperStyle?: ViewStyle;
    LeftComponent?: React.ReactNode;
    RightComponent?: React.ReactNode;
    children?: React.ReactNode;
    onPressIn?: () => void;
}

// Définition du composant 'CustomInput'.
export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    error,
    containerStyle,
    style,
    inputWrapperStyle,
    LeftComponent,
    RightComponent,
    children,
    onPressIn,
    editable,
    value,
    ...props
}) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const isError = !!error;
    const isClickable = editable === false && !!onPressIn;

    const CenterContent = () => {
        if (children) {
            return <View style={styles.contentContainer}>{children}</View>;
        }

        return (
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={theme.colors.textSecondary}
                editable={editable}
                value={value}
                {...props}
            />
        );
    };

    const InputWrapperComponent = isClickable ? Pressable : View;

    return (
        <View style={[styles.container, containerStyle]}>
            {!!label && <Text style={styles.label}>{label}</Text>}

            <InputWrapperComponent
                {...(isClickable ? { onPress: onPressIn } : {})}
                style={[
                    styles.inputWrapper,
                    isError ? styles.inputWrapperError : null,
                    inputWrapperStyle,
                ]}
            >
                {LeftComponent}
                {CenterContent()}
                {RightComponent}
            </InputWrapperComponent>

            {isError && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

// Styles dynamiques
const createStyles = (theme: any) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    label: {
        ...theme.typography.bodySmall,
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputWrapperError: {
        borderColor: theme.colors.danger,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 0,
        color: theme.colors.text,
        ...theme.typography.body,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            }
        })
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        marginTop: theme.spacing.xs,
    },
});