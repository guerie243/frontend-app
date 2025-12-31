import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { ENV } from '../config/env';

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
        if (!url) return;

        const handleDeepLink = (rawUrl: string) => {
            const { path } = Linking.parse(rawUrl);
            if (!path) return;

            console.log('[LinkingHandler] URL détectée :', path);

            // 1. Détection d'Annonce (/a/:slug)
            if (path.includes('a/')) {
                const slug = path.split('a/')[1]?.split('?')[0];
                if (slug) {
                    navigation.navigate('AnnonceDetail', { slug });
                }
            }

            // 2. Détection de Vitrine (/v/:slug)
            else if (path.includes('v/')) {
                const slug = path.split('v/')[1]?.split('?')[0];
                if (slug) {
                    navigation.navigate('VitrineDetail', { slug });
                }
            }

            // 3. Autres routes simples
            else if (path === 'login') navigation.navigate('Login');
            else if (path === 'register') navigation.navigate('Register');
            else if (path === 'settings') navigation.navigate('Settings');
        };

        handleDeepLink(url);
    }, [url, navigation]);

    return null; // Ce composant ne fait que de la logique
};
