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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppStack } from './AppStack';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppLoadingScreen } from '../components/AppLoadingScreen';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Création d'une instance globale de QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // Garder en mémoire pendant 24h (si inactif)
        },
    },
});

/**
 * Composant RootNavigator
 * 
 * Responsabilité : Afficher l'écran de chargement (Splash) au démarrage,
 * puis basculer vers l'application complète.
 */
export const RootNavigator = () => {
    const { isLoading: isAuthLoading } = useAuth();
    const { theme } = useTheme();
    const [isSplashTiming, setIsSplashTiming] = useState(true);

    useEffect(() => {
        // Force l'affichage du splash screen pendant au moins 2 secondes
        const timer = setTimeout(() => {
            setIsSplashTiming(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Affichage de l'écran de chargement premium (Andy Logo)
    // pendant la vérification initiale ET pendant le délai de 2 secondes
    if (isAuthLoading || isSplashTiming) {
        return <AppLoadingScreen />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <NavigationIndependentTree>
                    <NavigationContainer>
                        <AppStack />
                    </NavigationContainer>
                </NavigationIndependentTree>
            </View>
        </QueryClientProvider>
    );
};
