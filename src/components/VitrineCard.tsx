import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Vitrine } from '../types';
import Avatar from './Avatar';
import { DEFAULT_IMAGES } from '../constants/images';

interface VitrineCardProps {
    vitrine: Vitrine;
    onPress: () => void;
    variant?: 'scroll' | 'list';
}

export const VitrineCard: React.FC<VitrineCardProps> = ({ vitrine, onPress, variant = 'list' }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme, variant), [theme, variant]);

    const avatarUri = vitrine.avatar || vitrine.logo;
    const coverUri = vitrine.coverImage || vitrine.banner;

    // Logic to determine the best category label
    const rawType = vitrine.type;
    const rawCategory = vitrine.category;
    let categoryLabel = 'Général';

    if (rawType && rawType.toLowerCase() !== 'general' && rawType.toLowerCase() !== 'général') {
        categoryLabel = rawType;
    } else if (rawCategory && rawCategory.toLowerCase() !== 'general' && rawCategory.toLowerCase() !== 'général') {
        categoryLabel = rawCategory;
    } else if (rawType || rawCategory) {
        categoryLabel = rawType || rawCategory || 'Général';
    }

    if (variant === 'scroll') {
        return (
            <TouchableOpacity style={styles.scrollCard} onPress={onPress} activeOpacity={0.8}>
                {/* Cover Image */}
                <Image
                    source={coverUri ? coverUri : DEFAULT_IMAGES.cover}
                    style={styles.scrollCover}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                />

                {/* Avatar positioned over cover */}
                <View style={styles.scrollAvatarContainer}>
                    <Avatar
                        size={90}
                        source={avatarUri ? { uri: avatarUri } : DEFAULT_IMAGES.avatar}
                        style={{}}
                    />
                </View>

                {/* Info Section */}
                <View style={styles.scrollInfo}>
                    <Text style={[styles.scrollName, { color: theme.colors.text }]} numberOfLines={2}>
                        {vitrine.name}
                    </Text>
                    <Text style={[styles.scrollCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {categoryLabel}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    // List variant
    return (
        <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8}>
            <Avatar
                size={50}
                source={avatarUri ? { uri: avatarUri } : DEFAULT_IMAGES.avatar}
                style={{}}
            />
            <View style={styles.listInfo}>
                <Text style={[styles.listName, { color: theme.colors.text }]} numberOfLines={1}>
                    {vitrine.name}
                </Text>
                <Text style={[styles.listCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {categoryLabel}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any, variant: 'scroll' | 'list') => StyleSheet.create({
    // Scroll variant styles
    scrollCard: {
        width: 300, // Doublé de 150 à 300
        height: 240, // Augmenté de 20% (200 * 1.2 = 240)
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        marginRight: theme.spacing.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    scrollCover: {
        width: '100%',
        height: 120, // Augmenté proportionnellement (100 * 1.2)
    },
    scrollAvatarContainer: {
        position: 'absolute',
        top: 65, // Ajusté pour avatar 90px (120 - 55)
        left: '25%', // Décalé à 25% au lieu de centré
        transform: [{ translateX: -45 }], // Centrer l'avatar 90px sur la position 25%
        borderWidth: 3,
        borderColor: theme.colors.surface,
        borderRadius: 45, // Rayon = taille avatar / 2 pour cercle parfait
        overflow: 'hidden',
    },
    scrollInfo: {
        flex: 1,
        paddingTop: theme.spacing.l,
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.s,
        justifyContent: 'center',
        alignItems: 'flex-start', // Aligné à gauche au lieu de center
    },
    scrollName: {
        ...theme.typography.body,
        fontWeight: '600',
        textAlign: 'left', // Aligné à gauche au lieu de center
        marginBottom: 4,
        width: '100%',
    },
    scrollCategory: {
        ...theme.typography.caption,
        textAlign: 'left', // Aligné à gauche au lieu de center
        width: '100%',
    },

    // List variant styles
    listCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginHorizontal: theme.spacing.s,
        marginVertical: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listInfo: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    listName: {
        ...theme.typography.body,
        fontWeight: '600',
        marginBottom: 4,
    },
    listCategory: {
        ...theme.typography.caption,
    },
});
