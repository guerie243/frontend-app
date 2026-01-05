import React, { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

/**
 * LinkingHandler
 * 
 * Ce composant écoute les changements d'URL (Deep Linking / Web)
 * et redirige manuellement le Stack de navigation de React Navigation.
 * 
 * Il résout le conflit entre Expo Router (qui possède le conteneur racine)
 * et notre stack manuel de navigation.
 */
export const LinkingHandler = () => {
    const navigation = useNavigation<any>();
    const url = Linking.useURL();
    const lastHandledUrl = useRef<string | null>(null);

    useEffect(() => {
        // Source de vérité brute pour l'URL
        let currentUrl = url;

        // Sur le Web, on préfère window.location comme source de vérité immédiate
        if (Platform.OS === 'web') {
            currentUrl = window.location.href;
        }

        if (!currentUrl || currentUrl === lastHandledUrl.current) return;
        lastHandledUrl.current = currentUrl;

        const handleDeepLink = (rawUrl: string) => {
            console.log('[LinkingHandler] URL détectée :', rawUrl);

            let path = '';

            if (Platform.OS === 'web') {
                // Sur le Web, on utilise directement le pathname pour éviter les erreurs de parsing de schéma
                path = window.location.pathname;
            } else {
                // Sur Mobile, on utilise Linking.parse d'Expo
                const parsed = Linking.parse(rawUrl);
                path = parsed.path || '';
            }

            if (!path || path === '/') return;

            // Nettoyage : enlever les slashes de début et de fin
            const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
            console.log('[LinkingHandler] Path nettoyé :', cleanPath);

            // Petit délai pour s'assurer que le StackNavigator est prêt après le Splash
            setTimeout(() => {
                try {
                    // 1. Détection d'Annonce (a/slug ou /a/slug)
                    if (cleanPath.startsWith('a/')) {
                        const segments = cleanPath.split('/');
                        let slug = segments[1]; // Prend ce qui suit 'a/'

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Navigation vers AnnonceDetail :', slug);
                            navigation.navigate('AnnonceDetail', { slug });
                        }
                    }

                    // 2. Détection de Vitrine (v/slug ou /v/slug)
                    else if (cleanPath.startsWith('v/')) {
                        const segments = cleanPath.split('/');
                        let slug = segments[1];

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Navigation vers VitrineDetail :', slug);
                            navigation.navigate('VitrineDetail', { slug });
                        }
                    }

                    // 3. Autres routes simples
                    else {
                        const simplePage = cleanPath.split('?')[0];
                        if (simplePage === 'login') navigation.navigate('Login');
                        else if (simplePage === 'register') navigation.navigate('Register');
                        else if (simplePage === 'settings') navigation.navigate('Settings');
                    }
                } catch (error) {
                    console.error('[LinkingHandler] Erreur lors de la navigation :', error);
                }
            }, 100); // 100ms de sécurité
        };

        handleDeepLink(currentUrl);
    }, [url, navigation]);

    return null;
};
