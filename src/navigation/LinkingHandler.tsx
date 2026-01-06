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
    const hasHandledInitialUrl = useRef(false);

    useEffect(() => {
        // Source de vérité brute pour l'URL
        let currentUrl = url;

        if (Platform.OS === 'web') {
            currentUrl = window.location.href;
        }

        if (!currentUrl || hasHandledInitialUrl.current) return;

        // On évite de retraiter si l'URL contient déjà nos marqueurs de navigation interne (ex: /MainTabs)
        // car cela signifie que React Navigation est déjà en train de synchroniser l'URL.
        if (currentUrl.includes('/MainTabs') || currentUrl.includes('AnnonceDetail') || currentUrl.includes('VitrineDetail')) {
            return;
        }

        const handleDeepLink = (rawUrl: string) => {
            console.log('[LinkingHandler] URL brute détectée :', rawUrl);

            let path = '';
            let queryParams: Record<string, string> = {};

            if (Platform.OS === 'web') {
                path = window.location.pathname;
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.forEach((value, key) => queryParams[key] = value);
            } else {
                const parsed = Linking.parse(rawUrl);
                path = parsed.path || '';
                queryParams = (parsed.queryParams as Record<string, string>) || {};
            }

            const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
            if (!cleanPath || cleanPath === '/') return;

            console.log('[LinkingHandler] Processing path:', cleanPath);

            setTimeout(() => {
                try {
                    let handled = false;

                    // 1. Détection d'Annonce (/a/slug ou /AnnonceDetail)
                    if (cleanPath.startsWith('a/') || cleanPath === 'AnnonceDetail') {
                        const segments = cleanPath.split('/');
                        let slug = queryParams.slug || queryParams.annonceSlug || segments[1];

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Routing vers AnnonceDetail :', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'AnnonceDetail', params: { slug } }
                                ],
                            });
                            handled = true;
                        }
                    }

                    // 2. Détection de Vitrine (/v/slug ou /VitrineDetail)
                    else if (cleanPath.startsWith('v/') || cleanPath === 'VitrineDetail') {
                        const segments = cleanPath.split('/');
                        let slug = queryParams.slug || queryParams.vitrineSlug || segments[1];

                        if (slug) {
                            // Nettoyage du slug et gestion des IDs potentiels
                            slug = decodeURIComponent(slug).split('?')[0];
                            console.log('[LinkingHandler] Routing vers VitrineDetail avec slug/id :', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'VitrineDetail', params: { slug } }
                                ],
                            });
                            handled = true;
                        }
                    }

                    // 3. Autres routes
                    else {
                        const simplePage = cleanPath.split('?')[0];
                        if (['login', 'register', 'settings'].includes(simplePage)) {
                            navigation.navigate(simplePage.charAt(0).toUpperCase() + simplePage.slice(1));
                            handled = true;
                        }
                    }

                    if (handled) {
                        hasHandledInitialUrl.current = true;
                    }
                } catch (error) {
                    console.error('[LinkingHandler] Erreur de navigation :', error);
                }
            }, 500); // Délai accru pour laisser le temps au Stack d'être prêt
        };

        handleDeepLink(currentUrl);
    }, [url, navigation]);

    return null;
};
