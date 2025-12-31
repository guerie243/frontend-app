import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StateMessageProps {
    type: 'empty' | 'error' | 'no-results';
    message: string;
    onRetry?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
}

export const StateMessage = ({ type, message, onRetry, icon }: StateMessageProps) => {
    const { theme } = useTheme();

    const getIcon = () => {
        if (icon) return icon;
        switch (type) {
            case 'empty': return 'folder-open-outline';
            case 'error': return 'alert-circle-outline';
            case 'no-results': return 'search-outline';
            default: return 'information-circle-outline';
        }
    };

    return (
        <View style={styles.container}>
            <Ionicons
                name={getIcon()}
                size={48}
                color={type === 'error' ? '#EF4444' : theme.colors.textTertiary}
                style={styles.icon}
            />
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {message}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    style={[styles.retryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Réessayer</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
});
