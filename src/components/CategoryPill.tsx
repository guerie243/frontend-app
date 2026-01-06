import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { CategoryAnnonce } from '../Data/vitrinecategorys';

// Taille par défaut du composant (largeur/hauteur)
const DEFAULT_PILL_SIZE = 100;

// Ratio par défaut de l'image (l'image fera 75% de la taille totale du composant)
const DEFAULT_IMAGE_RATIO = 0.75;

interface CategoryPillProps {
    name: string;
    slug: string;
    imageUri: string;
    isSelected: boolean;
    onPress: (categorySlug: string) => void;
    style?: any;
    size?: number;
    imageRatio?: number;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
    name,
    slug,
    imageUri,
    isSelected,
    onPress,
    style,
    size = DEFAULT_PILL_SIZE,
    imageRatio = DEFAULT_IMAGE_RATIO
}) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const actualImageRatio = Math.min(1.0, Math.max(0.1, imageRatio));
    const pillSize = size;
    const imageSize = pillSize * actualImageRatio;
    const borderRadius = imageSize / 2;

    // Styles dynamiques combinés avec useMemo pour la performance
    const dynamicPropsStyles = StyleSheet.create({
        pillContainer: {
            width: pillSize,
            height: pillSize,
        },
        imageContainer: {
            width: imageSize,
            height: imageSize,
            borderRadius: borderRadius,
        },
        image: {
            width: imageSize,
            height: imageSize,
        },
    });

    const pillStyle = isSelected
        ? { backgroundColor: 'transparent' } // Use logic or token
        : {};

    const textStyle = isSelected
        ? { color: theme.colors.primary, fontWeight: '700' }
        : { color: theme.colors.textSecondary };

    return (
        <TouchableOpacity
            style={[styles.basePillContainer, dynamicPropsStyles.pillContainer, pillStyle, style]}
            onPress={() => onPress(slug)}
            activeOpacity={0.7}
        >
            <View style={[styles.baseImageContainer, dynamicPropsStyles.imageContainer]}>
                <Image
                    source={imageUri}
                    style={dynamicPropsStyles.image}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                />
            </View>
            <Text style={[styles.nameText, textStyle]}>{name}</Text>
        </TouchableOpacity>
    );
};

// Styles statiques (par rapport aux props, mais dynamiques par rapport au thème)
const createStyles = (theme: any) => StyleSheet.create({
    basePillContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: theme.spacing.s,
        paddingBottom: theme.spacing.xs,
    },
    baseImageContainer: {
        backgroundColor: theme.colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xs / 2,
        overflow: 'hidden',
    },
    nameText: {
        ...theme.typography.caption,
        textAlign: 'center',
        fontWeight: '600',
        maxWidth: '100%',
    },
});
