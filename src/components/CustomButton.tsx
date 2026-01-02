import React from 'react';
// Importe les éléments de base de React Native pour un bouton interactif.
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
// Importe les constantes de style (couleurs, espacements, etc.) de l'application.
import { useTheme } from '../context/ThemeContext';

// Définition de l'interface TypeScript pour les propriétés du bouton.
interface CustomButtonProps {
    // Le texte affiché sur le bouton.
    title: string;
    // La fonction de rappel exécutée au clic.
    onPress: () => void;
    // Traduction : 'variant' = Variation (Style prédéfini).
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    // Traduction : 'isLoading' = Est en cours de chargement (affiche l'indicateur).
    isLoading?: boolean;
    // Traduction : 'disabled' = Est désactivé.
    disabled?: boolean;
    // Style personnalisé pour le conteneur du bouton.
    style?: StyleProp<ViewStyle>;
    // Style personnalisé pour le texte.
    textStyle?: StyleProp<TextStyle>;
}

// Définition du composant 'CustomButton'.
export const CustomButton: React.FC<CustomButtonProps> = ({
    // Déstructuration des propriétés avec valeurs par défaut.
    title,
    onPress,
    variant = 'primary', // Variation par défaut : 'primaire'.
    isLoading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    // Fonction pour déterminer la couleur de fond en fonction de la variation et de l'état.
    const getBackgroundColor = () => {
        // Si désactivé, couleur de surface claire du thème.
        if (disabled) return theme.colors.surfaceLight;
        switch (variant) {
            case 'primary': return theme.colors.primary; // Couleur primaire.
            case 'secondary': return theme.colors.secondary; // Couleur secondaire.
            case 'danger': return theme.colors.danger; // Couleur de danger (alerte).
            case 'outline': return 'transparent'; // Contour : fond transparent.
            default: return theme.colors.primary;
        }
    };

    // Fonction pour déterminer la couleur du texte.
    const getTextColor = () => {
        // Si désactivé, couleur de texte secondaire.
        if (disabled) return theme.colors.textSecondary;
        // Si 'outline', utilise la couleur primaire pour le texte.
        if (variant === 'outline') return theme.colors.primary;
        // Par défaut (boutons pleins), le texte est blanc.
        return theme.colors.white;
    };

    // Rendu du bouton.
    return (
        // Conteneur cliquable.
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                // Application du style de contour si la variation est 'outline'.
                variant === 'outline' && { borderColor: theme.colors.primary, borderWidth: 1 },
                style, // Application des styles personnalisés.
            ]}
            onPress={onPress}
            // Le bouton est désactivé si 'disabled' OU 'isLoading' est vrai.
            disabled={disabled || isLoading}
            activeOpacity={0.8} // Opacité réduite au toucher.
        >
            {/* Affichage conditionnel : indicateur de chargement OU texte */}
            {isLoading ? (
                // Affichage de l'indicateur de chargement.
                <ActivityIndicator color={getTextColor()} />
            ) : (
                // Affichage du texte (title).
                <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

// Définition des styles CSS pour le composant.
const createStyles = (theme: any) => StyleSheet.create({
    button: {
        height: 50,
        borderRadius: theme.borderRadius.m, // Bordures arrondies (medium).
        justifyContent: 'center', // Centrage vertical.
        alignItems: 'center', // Centrage horizontal.
        paddingHorizontal: theme.spacing.m,
        marginVertical: theme.spacing.s,
    },
    text: {
        ...theme.typography.button, // Utilise la typographie définie dans le thème.
    },
});
