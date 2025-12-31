import React, { useMemo } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
    ViewStyle,
    Alert,
    StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { copyToClipboard } from '../utils/clipboardUtils';
import { ENV } from '../config/env';

// --- Interfaces ---
interface ShareButtonProps {
    pagePath: string; // La partie spécifique au contenu (e.g., 'produit/123')
    shareData?: {
        // Rendu optionnel et inutilisé dans cette version simplifiée
        title?: string;
    };
    style?: StyleProp<ViewStyle>; // Style appliqué au TouchableOpacity
    size?: number;
    color?: string;
    children?: React.ReactNode;
}


// --- Composant Fonctionnel ---
export const ShareButton: React.FC<ShareButtonProps> = ({
    pagePath,
    style,
    size = 24,
    color,
    children,
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Default color if none provided
    const iconColor = color || theme.colors.textSecondary;

    const fullUrl = `${ENV.SHARE_BASE_URL}/${pagePath || ''}`;

    // --- Fonction Unique : Copier le lien ---
    const handleCopyLink = () => {
        if (!pagePath) {
            Alert.alert("Erreur", "Le lien n'est pas disponible.");
            return;
        }

        // Exécute la copie
        copyToClipboard(fullUrl);

        // Affiche un retour utilisateur clair
        Alert.alert("Lien copié", "Le lien a été copié dans le presse-papiers.");
    };


    // --- Rendu ---
    return (
        // Le bouton est cliquable directement, plus de modale
        <View style={styles.container}>
            <TouchableOpacity
                // Le style permet au bouton de prendre l'espace nécessaire et d'être cliquable
                style={[styles.shareButton, style || {}]}
                onPress={handleCopyLink} // Appel direct à la fonction de copie
                activeOpacity={0.7}
            >
                {/* Icône de Partage standard Ionicons */}
                <Ionicons name="share-social-outline" size={size} color={iconColor} />
                {/* Afficher les enfants (texte "Partager" par exemple) */}
                {children}
            </TouchableOpacity>
        </View>
    );
};

// --- Styles ---
const createStyles = (theme: any) => StyleSheet.create({
    container: {
        // Le conteneur doit s'étendre pour que le bouton soit cliquable
        flex: 1,
    },
    shareButton: {
        padding: 0,
        flex: 1, // Le TouchableOpacity prend tout l'espace
        borderRadius: theme.borderRadius.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Aucun autre style de modale n'est nécessaire.
});