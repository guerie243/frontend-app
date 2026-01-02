/**
 * Configuration du Service API avec Axios - Mode Invité
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * Gestion intelligente des erreurs 401 :
 * - Si l'utilisateur est invité : Message d'erreur, pas de déconnexion
 * - Si l'utilisateur est authentifié : Token expiré, déconnexion nécessaire
 */

import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { storage } from '../utils/storage';

import { ENV } from '../config/env';

/**
 * Configuration de l'URL de base du backend
 * À MODIFIER selon votre environnement
 */
export const API_URL = ENV.API_URL;
const BASE_URL = ENV.API_URL;

/**
 * Instance Axios configurée
 */
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

/**
 * Intercepteur de Requête
 * Attache automatiquement le token JWT si disponible
 */
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('userToken');

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du token', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Intercepteur de Réponse - Gestion Intelligente des Erreurs 401
 * 
 * NOUVEAU COMPORTEMENT pour le mode invité :
 * 
 * Scénario 1 : Utilisateur INVITÉ tente une action protégée
 * - Erreur 401 attendue (pas de token)
 * - Afficher un message d'erreur en français
 * - NE PAS déconnecter (l'utilisateur est déjà invité)
 * - NE PAS naviguer automatiquement
 * 
 * Scénario 2 : Utilisateur AUTHENTIFIÉ avec token expiré
 * - Erreur 401 inattendue (token invalide/expiré)
 * - Supprimer le token
 * - Retour au mode invité
 * - L'utilisateur peut continuer à naviguer
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Marquer la requête pour éviter les boucles infinies
            originalRequest._retry = true;

            try {
                // Vérifier si un token existe
                const token = await storage.getItem('userToken');

                if (token) {
                    /**
                     * SCÉNARIO 2 : Token expiré/invalide
                     * L'utilisateur était authentifié mais son token n'est plus valide
                     */
                    console.log('Token expiré détecté - Retour au mode invité');

                    // Suppression du token expiré
                    await storage.deleteItem('userToken');
                    await storage.deleteItem('userData');

                    // Émettre l'événement global pour que l'AuthContext mette à jour l'état
                    // L'alerte sera affichée par le composant qui écoute cet événement
                    DeviceEventEmitter.emit('auth:session_expired');
                } else {
                    /**
                     * SCÉNARIO 1 : Utilisateur invité
                     * Aucun token n'existe, l'utilisateur est en mode invité
                     * et a tenté une action protégée
                     */
                    console.log('Action protégée tentée en mode invité');

                    // Émettre un événement pour que le composant affiche l'alerte
                    DeviceEventEmitter.emit('auth:login_required');
                }
            } catch (e) {
                console.error('Erreur lors de la gestion de l\'erreur 401', e);
            }
        }

        // Propagation de l'erreur pour gestion dans les composants
        return Promise.reject(error);
    }
);

export default api;
