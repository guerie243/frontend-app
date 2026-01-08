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
import { View, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StartupSplash } from '../components/StartupSplash';
import { LoadingComponent } from '../components/LoadingComponent';
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
 * Configuration de Deep Linking pour React Navigation
 * Cette configuration agit comme un fallback au LinkingHandler
 */
const linking = {
    prefixes: [
        'andyapp://',
        'https://andyrdc.vercel.app',
        'https://andy.com',
        ...(Platform.OS === 'web' ? [
            typeof window !== 'undefined' ? window.location.origin : ''
        ].filter(Boolean) : [])
    ],
    config: {
        screens: {
            MainTabs: {
                path: '', // Route racine
                screens: {
                    Home: 'home',
                    Explore: 'explore',
                    MyVitrine: 'my-vitrine',
                    Profile: 'profile',
                },
            },
            // Routes directes pour deep linking
            AnnonceDetail: {
                path: 'a/:slug',
                parse: {
                    slug: (slug: string) => decodeURIComponent(slug),
                },
            },
            VitrineDetail: {
                path: 'v/:slug',
                parse: {
                    slug: (slug: string) => decodeURIComponent(slug),
                },
            },
            Login: 'login',
            Register: 'register',
            Settings: 'settings',
        },
    },
};

// État global hors du composant pour persister malgré les re-mounts de React Navigation/Expo Router
let hasShownSplashSession = false;

/**
 * Composant RootNavigator
 * 
 * Responsabilité : Afficher l'écran de démarrage premium (StartupSplash) UNIQUEMENT au premier chargement,
 * puis basculer vers l'application complète. 
 */
export const RootNavigator = () => {
    const { isLoading: isAuthLoading } = useAuth();
    const { theme } = useTheme();

    // Si nous avons déjà montré le splash dans cette session, on ne le remontre plus
    const [isSplashTiming, setIsSplashTiming] = useState(!hasShownSplashSession);

    useEffect(() => {
        if (hasShownSplashSession) return;

        // Force l'affichage du splash screen pendant au moins 2 secondes au démarrage initial
        const timer = setTimeout(() => {
            setIsSplashTiming(false);
            hasShownSplashSession = true;
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Affichage de l'écran de démarrage premium (Avec Logo)
    // uniquement au TOUT PREMIER démarrage de la session
    if (!hasShownSplashSession && (isAuthLoading || isSplashTiming)) {
        return <StartupSplash />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <NavigationIndependentTree>
                    <NavigationContainer
                        linking={linking}
                        fallback={<LoadingComponent />}
                        onReady={() => {
                            console.log('[RootNavigator] Navigation prête avec deep linking configuré');
                        }}
                    >
                        <AppStack />
                    </NavigationContainer>
                </NavigationIndependentTree>
            </View>
        </QueryClientProvider>
    );
};
