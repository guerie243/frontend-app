import { z } from 'zod';

/**
 * Schéma de validation pour les variables d'environnement.
 * Utilise Zod pour garantir que toutes les variables requises sont présentes et valides.
 */
const envSchema = z.object({
    /**
     * URL de base de l'API Backend.
     * Obligatoire pour toutes les communications réseau.
     */
    API_URL: z.string().url().default('https://backend-app-3fyc.onrender.com'),

    /**
     * URL principale de l'application.
     */
    APP_URL: z.string().url().default('https://backend-app-3fyc.onrender.com'),

    /**
     * URL pour les assets et le stockage.
     */
    STORAGE_URL: z.string().url().default('https://backend-app-3fyc.onrender.com'),

    /**
     * URL de base pour la génération de liens de partage.
     */
    SHARE_BASE_URL: z.string().url().default('https://andy.com'),
});

/**
 * Extraction et validation des variables d'environnement.
 * Expo charge automatiquement les variables préfixées par EXPO_PUBLIC_.
 */
const parsedEnv = envSchema.safeParse({
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    APP_URL: process.env.EXPO_PUBLIC_APP_URL,
    STORAGE_URL: process.env.EXPO_PUBLIC_STORAGE_URL,
    SHARE_BASE_URL: process.env.EXPO_PUBLIC_SHARE_BASE_URL,
});

if (!parsedEnv.success) {
    console.warn('⚠️ Variables d\'environnement invalides ou manquantes, utilisation des valeurs par défaut :', parsedEnv.error.format());
}

/**
 * Export de l'objet ENV validé.
 * On utilise les valeurs castées par Zod (avec les defaults si nécessaire).
 */
export const ENV = parsedEnv.success ? parsedEnv.data : {
    API_URL: 'https://backend-app-3fyc.onrender.com',
    APP_URL: 'https://backend-app-3fyc.onrender.com',
    STORAGE_URL: 'https://backend-app-3fyc.onrender.com',
    SHARE_BASE_URL: 'https://andy.com',
};

export type EnvConfig = z.infer<typeof envSchema>;
