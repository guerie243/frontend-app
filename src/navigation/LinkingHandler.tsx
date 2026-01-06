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
            console.log('[LinkingHandler] URL brute détectée :', rawUrl);

            let path = '';
            let queryParams: Record<string, string> = {};

            if (Platform.OS === 'web') {
                // Sur le Web, on utilise directement window.location
                path = window.location.pathname;
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });
            } else {
                // Sur Mobile, on utilise Linking.parse d'Expo
                const parsed = Linking.parse(rawUrl);
                path = parsed.path || '';
                queryParams = (parsed.queryParams as Record<string, string>) || {};
            }

            // Nettoyage : enlever les slashes de début et de fin
            const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
            console.log('[LinkingHandler] Path nettoyé :', cleanPath);
            console.log('[LinkingHandler] Query Params :', queryParams);

            if (!cleanPath || cleanPath === '/') return;

            // Délai pour s'assurer que le StackNavigator est prêt après le Splash
            setTimeout(() => {
                try {
                    // 1. Détection d'Annonce
                    // Formats supportés : /a/slug, /AnnonceDetail?slug=slug
                    if (cleanPath.startsWith('a/') || cleanPath === 'AnnonceDetail') {
                        const segments = cleanPath.split('/');
                        let slug = queryParams.slug || queryParams.annonceSlug || segments[1];

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Routing vers AnnonceDetail slug:', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'AnnonceDetail', params: { slug } }
                                ],
                            });
                        }
                    }

                    // 2. Détection de Vitrine
                    // Formats supportés : /v/slug, /VitrineDetail?slug=slug
                    else if (cleanPath.startsWith('v/') || cleanPath === 'VitrineDetail') {
                        const segments = cleanPath.split('/');
                        let slug = queryParams.slug || queryParams.vitrineSlug || segments[1];

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Routing vers VitrineDetail slug:', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'VitrineDetail', params: { slug } }
                                ],
                            });
                        }
                    }

                    // 3. Autres routes simples
                    else {
                        const simplePage = cleanPath.split('?')[0];
                        console.log('[LinkingHandler] Tentative de navigation simple vers :', simplePage);
                        if (simplePage === 'login') navigation.navigate('Login');
                        else if (simplePage === 'register') navigation.navigate('Register');
                        else if (simplePage === 'settings') navigation.navigate('Settings');
                        else if (simplePage === 'AnnonceModificationMain') {
                            const slug = queryParams.slug || queryParams.annonceSlug;
                            if (slug) navigation.navigate('AnnonceModificationMain', { annonceSlug: slug });
                        }
                    }
                } catch (error) {
                    console.error('[LinkingHandler] Erreur lors de la navigation :', error);
                }
            }, 300);
        };

        handleDeepLink(currentUrl);
    }, [url, navigation]);

    return null;
};
