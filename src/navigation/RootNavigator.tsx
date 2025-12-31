/**
 * RootNavigator - Navigation Racine Sans Protection
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * Changement majeur : Ce navigateur n'effectue PLUS de vérification d'authentification
 * pour décider quelle interface afficher.
 * 
 * Comportement :
 * - Affiche TOUJOURS l'application complète (AppStack)
 * - Les invités peuvent naviguer librement
 * - Les actions sensibles sont protégées au niveau des composants individuels
 * 
 * Ancien comportement (SUPPRIMÉ) :
 * - userToken ? <AppStack /> : <AuthStack />
 * 
 * Nouveau comportement :
 * - Toujours <AppStack />
 * - Login/Register sont des écrans normaux dans le stack
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppStack } from './AppStack';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Composant RootNavigator
 * 
 * Responsabilité unique : Afficher l'écran de chargement pendant la vérification initiale,
 * puis afficher l'application complète.
 * 
 * Plus de logique conditionnelle basée sur l'authentification !
 */
export const RootNavigator = () => {
    const { isLoading } = useAuth();
    const { theme } = useTheme();

    // Affichage de l'écran de chargement uniquement pendant la vérification initiale du token
    // (au démarrage de l'application)
    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background
            }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    /**
     * CHANGEMENT MAJEUR : Toujours afficher l'application complète
     * 
     * Que l'utilisateur soit invité ou authentifié, il voit la même interface.
     * La différence se situe au niveau des actions disponibles dans chaque écran.
     * 
     * Avantages :
     * - Navigation fluide pour les invités
     * - Découverte du contenu sans barrière
     * - Incitation à se connecter au moment opportun (lors d'une action)
     */
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppStack />
        </View>
    );
};
