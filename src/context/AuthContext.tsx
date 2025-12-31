/**
 * AuthContext - Gestion de l'authentification avec Mode Invité
 *  * ARCHITECTURE REFACTORISÉE : Guest-Usable
 *  * Ce contexte gère deux modes d'utilisation :
 * 1. Mode Invité (isGuest = true) : L'utilisateur peut naviguer et voir tout le contenu
 * 2. Mode Authentifié (isAuthenticated = true) : L'utilisateur peut effectuer des actions sensibles
 *  * Principe : Le contenu est public, seules les actions sont protégées
 */

import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

// Bloc de documentation expliquant la refonte pour le support du Mode Invité 
// et l'importation des dépendances React et Expo SecureStore pour le stockage sécurisé.

export interface User {
    userId: string;
    username: string;
    email?: string;
    profileName: string;
    phoneNumber?: string;
}
// Définition de l'interface `User` représentant les données de l'utilisateur authentifié.

interface AuthContextType {
    jwt: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
}
// Définition de l'interface `AuthContextType` qui spécifie la structure complète 
// de l'état du contexte (y compris les flags `isGuest` et `isAuthenticated`) et les méthodes (`login`, `logout`).

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Création de l'objet Context React.

/**
 * Provider d'authentification avec support du mode invité
 *  * Comportement au démarrage :
 * 1. Vérifie si un token existe dans le stockage sécurisé
 * 2. Si OUI : Mode authentifié
 * 3. Si NON : Mode invité (état par défaut)
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jwt, setJwt] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = jwt !== null;
    const isGuest = jwt === null;
    // Définition du composant `AuthProvider` et initialisation des états.
    // Les booléens `isAuthenticated` et `isGuest` sont des valeurs dérivées de l'état `jwt`.

    useEffect(() => {
        /**
         * Fonction de démarrage (bootstrap)
         * * Vérifie si un token existe au lancement de l'application.
         * Si OUI : Restaure la session utilisateur
         * Si NON : Démarre en mode invité (pas d'erreur, c'est normal)
         */
        const bootstrapAsync = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('userToken');
                const storedUserData = await SecureStore.getItemAsync('userData');

                if (storedToken && storedUserData) {
                    setJwt(storedToken);
                    setUser(JSON.parse(storedUserData));
                    console.log('Session restaurée : Mode authentifié');
                } else {
                    console.log('Démarrage en mode invité');
                }
            } catch (e) {
                console.error('Erreur lors de la restauration de la session', e);
                console.log('Démarrage en mode invité (après erreur)');
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();

        // Écouteur d'événement pour l'expiration de session (déclenché par api.ts)
        const subscription = DeviceEventEmitter.addListener('auth:session_expired', () => {
            console.log('Événement session expirée reçu : Déconnexion forcée');
            // On force la mise à jour de l'état local pour refléter le mode invité
            setJwt(null);
            setUser(null);
        });

        return () => {
            subscription.remove();
        };
    }, []);
    // Hook `useEffect` pour gérer la logique de démarrage : 
    // Tente de récupérer le JWT et les données utilisateur du stockage sécurisé. 
    // Met fin à l'état `isLoading` une fois la vérification terminée.

    /**
     * Méthode de connexion
     * * Passe du mode invité au mode authentifié
     * Stocke le token et les données utilisateur de manière sécurisée
     * * @param token - Token JWT reçu du backend
     * @param userData - Données de l'utilisateur
     */
    const login = async (token: string, userData: User) => {
        setIsLoading(true);
        try {
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));

            setJwt(token);
            setUser(userData);

            console.log('Connexion réussie : Mode authentifié activé');
        } catch (e) {
            console.error('Échec de la connexion', e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
    // Fonction `login` : Stocke le token et les données dans SecureStore, 
    // puis met à jour l'état pour passer en mode authentifié.

    /**
     * Méthode de déconnexion
     * * Passe du mode authentifié au mode invité
     * Supprime le token et les données utilisateur
     * L'utilisateur peut continuer à naviguer en mode invité
     */
    const logout = async () => {
        setIsLoading(true);
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');

            setJwt(null);
            setUser(null);

            console.log('Déconnexion réussie : Retour au mode invité');
        } catch (e) {
            console.error('Échec de la déconnexion', e);
        } finally {
            setIsLoading(false);
        }
    };
    // Fonction `logout` : Supprime le token et les données de SecureStore, 
    // puis réinitialise l'état pour revenir au mode invité.

    return (
        <AuthContext.Provider
            value={{
                jwt,
                user,
                isAuthenticated,
                isGuest,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
// Le `AuthProvider` enveloppe les composants enfants et fournit l'état et les méthodes d'authentification via `AuthContext.Provider`.

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 *  * Utilisation dans un composant :
 * ```typescript
 * const { isGuest, isAuthenticated, user, login, logout } = useAuth();
 *  * // Vérifier si l'utilisateur est invité
 * if (isGuest) {
 *   return <GuestPrompt />;
 * }
 *  * // Vérifier si l'utilisateur est authentifié
 * if (isAuthenticated) {
 *   return <EditButton />;
 * }
 * ```
 *  * @throws Error si utilisé en dehors d'un AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};
// Définition du hook personnalisé `useAuth` pour faciliter la consommation du contexte
// dans les composants et assurer qu'il est utilisé à l'intérieur du `AuthProvider`.