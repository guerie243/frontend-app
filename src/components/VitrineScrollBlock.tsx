import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Vitrine } from '../types';
import { VitrineCard } from './VitrineCard';
import { Ionicons } from '@expo/vector-icons';

interface VitrineScrollBlockProps {
    vitrines: Vitrine[];
    onVitrinePress: (slug: string) => void;
    onSeeMorePress: () => void;
    isLoading?: boolean;
}

export const VitrineScrollBlock: React.FC<VitrineScrollBlockProps> = ({
    vitrines,
    onVitrinePress,
    onSeeMorePress,
    isLoading = false
}) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    if (!vitrines || vitrines.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="storefront-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Vitrines à découvrir
                    </Text>
                </View>
                <TouchableOpacity onPress={onSeeMorePress} style={styles.seeMoreButton}>
                    <Text style={[styles.seeMoreText, { color: theme.colors.primary }]}>
                        Voir plus
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {vitrines.slice(0, 6).map((vitrine) => (
                    <VitrineCard
                        key={vitrine.vitrineId}
                        vitrine={vitrine}
                        onPress={() => onVitrinePress(vitrine.slug)}
                        variant="scroll"
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.m,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.s,
        marginBottom: theme.spacing.m,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: theme.spacing.s,
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeMoreText: {
        ...theme.typography.button,
        fontSize: 14,
        marginRight: 4,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.s,
    },
    loadingContainer: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
