import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Annonce } from '../types';
import { DEFAULT_IMAGES } from '../constants/images';

interface AnnonceCardProps {
    annonce: Annonce;
    onPress: () => void;
}

// Fonction utilitaire pour trouver la première URI dans la structure d'images complexe
const getFirstImageUri = (images: any): string | null => {
    if (!images) return null;

    // Fonction récursive pour parcourir la structure
    const findUri = (item: any): string | null => {
        if (typeof item === 'string') {
            return item; // Au cas où l'image serait directement une chaîne (URI)
        }
        if (item && (item.uri || item.url)) {
            return item.uri || item.url; // Trouvé un objet image valide
        }
        if (Array.isArray(item)) {
            for (const subItem of item) {
                const result = findUri(subItem);
                if (result) return result; // Arrêter dès qu'on trouve la première URI
            }
        }
        return null; // Rien trouvé dans cet élément/tableau
    };

    return findUri(images); // Commencer la recherche avec le tableau d'images complet
};

export const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce, onPress }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    // 1. Utilisez la fonction utilitaire pour obtenir la première URI
    const firstImageUri = getFirstImageUri(annonce.images);

    // 2. Utilisez une URI de remplacement si aucune n'est trouvée
    const imageSource = firstImageUri ? { uri: firstImageUri } : DEFAULT_IMAGES.annonce;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {annonce.title}
                </Text>
                <Text style={styles.price}>
                    {annonce.price ? `${annonce.price} ${annonce.currency || 'USD'}` : 'Prix sur demande'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
        ...theme.shadows.small,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: theme.colors.surfaceLight,
    },
    content: {
        padding: theme.spacing.s,
    },
    title: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    price: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: '700',
    },
});
