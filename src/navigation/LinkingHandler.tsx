import React, { useEffect } from 'react';
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
 * et notre stack manuel.
 */
export const LinkingHandler = () => {
    const navigation = useNavigation<any>();
    const url = Linking.useURL();

    useEffect(() => {
        // Fallback pour le Web si Linking.useURL() ne renvoie rien au montage initial
        const currentUrl = url || (Platform.OS === 'web' ? window.location.href : null);

        if (!currentUrl) return;

        const handleDeepLink = (rawUrl: string) => {
            console.log('[LinkingHandler] URL brute détectée :', rawUrl);

            const { path: parsedPath } = Linking.parse(rawUrl);

            // Sur le Web, Linking.parse peut parfois retourner un path vide si l'URL est complexe.
            // On essaie d'extraire le path manuellement si nécessaire.
            let path = parsedPath;
            if (!path && rawUrl.includes('://')) {
                try {
                    const urlObj = new URL(rawUrl);
                    path = urlObj.pathname;
                } catch (e) {
                    // Fallback basique
                    const parts = rawUrl.split('://')[1]?.split('/');
                    if (parts && parts.length > 1) {
                        path = parts.slice(1).join('/');
                    }
                }
            }

            if (!path || path === '/') return;

            // Nettoyage : enlever le leading slash pour l'analyse
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            console.log('[LinkingHandler] Path analysé :', cleanPath);

            // 1. Détection d'Annonce (a/slug ou /a/slug)
            if (cleanPath.startsWith('a/')) {
                let slug = cleanPath.split('a/')[1]?.split('?')[0];
                if (slug) {
                    // Nettoyer les éventuels slashes traînants
                    slug = slug.replace(/\/$/, '');
                    // Décoder pour gérer les caractères spéciaux (@, espaces, etc.)
                    slug = decodeURIComponent(slug);

                    console.log('[LinkingHandler] Navigation vers AnnonceDetail :', slug);
                    navigation.navigate('AnnonceDetail', { slug });
                }
            }

            // 2. Détection de Vitrine (v/slug ou /v/slug)
            else if (cleanPath.startsWith('v/')) {
                let slug = cleanPath.split('v/')[1]?.split('?')[0];
                if (slug) {
                    slug = slug.replace(/\/$/, '');
                    slug = decodeURIComponent(slug);

                    console.log('[LinkingHandler] Navigation vers VitrineDetail :', slug);
                    navigation.navigate('VitrineDetail', { slug });
                }
            }

            // 3. Autres routes simples
            else {
                const simplePage = cleanPath.split('?')[0].replace(/\/$/, '');
                if (simplePage === 'login') navigation.navigate('Login');
                else if (simplePage === 'register') navigation.navigate('Register');
                else if (simplePage === 'settings') navigation.navigate('Settings');
            }
        };

        handleDeepLink(currentUrl);
    }, [url, navigation]);

    return null;
};
