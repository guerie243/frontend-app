import React, { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

/**
 * LinkingHandler
 * 
 * Gère la navigation profonde (Deep Linking) pour l'application.
 * Intercepte les URLs et navigue vers les bonnes pages pour les vitrines et annonces.
 * 
 * Patterns supportés:
 * - /a/{slug} -> AnnonceDetail
 * - /v/{slug} -> VitrineDetail
 * - /login, /register, /settings -> Écrans respectifs
 */
export const LinkingHandler = () => {
    const navigation = useNavigation<any>();
    const url = Linking.useURL();
    const processedUrls = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Déterminer l'URL courante selon la plateforme
        let currentUrl = url;

        if (Platform.OS === 'web') {
            currentUrl = window.location.href;
        }

        // Ne rien faire si pas d'URL
        if (!currentUrl) return;

        // Éviter le double traitement de la même URL
        if (processedUrls.current.has(currentUrl)) {
            console.log('[LinkingHandler] URL déjà traitée, skip:', currentUrl);
            return;
        }

        console.log('[LinkingHandler] 🔗 URL détectée:', currentUrl);

        const handleDeepLink = (rawUrl: string) => {
            let path = '';
            let queryParams: Record<string, string> = {};

            // Extraire le chemin et les paramètres selon la plateforme
            if (Platform.OS === 'web') {
                path = window.location.pathname;
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.forEach((value, key) => queryParams[key] = value);
            } else {
                const parsed = Linking.parse(rawUrl);
                path = parsed.path || '';
                queryParams = (parsed.queryParams as Record<string, string>) || {};
            }

            // Nettoyer le chemin
            const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');

            // Ignorer les chemins vides ou racine
            if (!cleanPath || cleanPath === '/') {
                console.log('[LinkingHandler] Chemin vide ou racine, skip');
                return;
            }

            // Ignorer si le chemin contient déjà des marqueurs de navigation interne
            // MAIS seulement si ce sont des chemins complets (pas juste /a/ ou /v/)
            if (cleanPath.includes('MainTabs/') || cleanPath === 'MainTabs') {
                console.log('[LinkingHandler] Navigation interne détectée, skip:', cleanPath);
                return;
            }

            console.log('[LinkingHandler] 📍 Traitement du chemin:', cleanPath);
            console.log('[LinkingHandler] 📦 Paramètres query:', queryParams);

            // Délai minimal pour s'assurer que le stack de navigation est prêt
            setTimeout(() => {
                try {
                    let handled = false;

                    // 1. DÉTECTION D'ANNONCE: /a/{slug}
                    if (cleanPath.startsWith('a/')) {
                        const segments = cleanPath.split('/').filter(s => s); // Filtrer les segments vides
                        let slug = segments[1]; // segments[0] = 'a', segments[1] = slug

                        // Fallback sur les query params si pas de slug dans le path
                        if (!slug) {
                            slug = queryParams.slug || queryParams.annonceSlug;
                        }

                        if (slug) {
                            // Nettoyer le slug (enlever query params éventuels)
                            slug = decodeURIComponent(slug).split('?')[0].split('#')[0];
                            console.log('[LinkingHandler] ✅ Navigation vers AnnonceDetail:', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'AnnonceDetail', params: { slug } }
                                ],
                            });
                            handled = true;
                        } else {
                            console.warn('[LinkingHandler] ⚠️ Slug d\'annonce non trouvé dans:', cleanPath);
                        }
                    }

                    // 2. DÉTECTION DE VITRINE: /v/{slug}
                    else if (cleanPath.startsWith('v/')) {
                        const segments = cleanPath.split('/').filter(s => s);
                        let slug = segments[1]; // segments[0] = 'v', segments[1] = slug

                        // Fallback sur les query params
                        if (!slug) {
                            slug = queryParams.slug || queryParams.vitrineSlug;
                        }

                        if (slug) {
                            slug = decodeURIComponent(slug).split('?')[0].split('#')[0];
                            console.log('[LinkingHandler] ✅ Navigation vers VitrineDetail:', slug);

                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'MainTabs' },
                                    { name: 'VitrineDetail', params: { slug } }
                                ],
                            });
                            handled = true;
                        } else {
                            console.warn('[LinkingHandler] ⚠️ Slug de vitrine non trouvé dans:', cleanPath);
                        }
                    }

                    // 3. AUTRES ROUTES (login, register, settings, etc.)
                    else {
                        const simplePage = cleanPath.split('/')[0].toLowerCase();
                        const routeMap: Record<string, string> = {
                            'login': 'Login',
                            'register': 'Register',
                            'settings': 'Settings',
                        };

                        if (routeMap[simplePage]) {
                            console.log('[LinkingHandler] ✅ Navigation vers:', routeMap[simplePage]);
                            navigation.navigate(routeMap[simplePage]);
                            handled = true;
                        }
                    }

                    if (handled) {
                        // Marquer cette URL comme traitée
                        processedUrls.current.add(rawUrl);
                        console.log('[LinkingHandler] ✨ Navigation réussie');
                    } else {
                        console.log('[LinkingHandler] ℹ️ Aucune route correspondante pour:', cleanPath);
                    }
                } catch (error) {
                    console.error('[LinkingHandler] ❌ Erreur de navigation:', error);
                }
            }, 100); // Réduit à 100ms pour une navigation plus rapide
        };

        handleDeepLink(currentUrl);
    }, [url, navigation]);

    return null;
};
