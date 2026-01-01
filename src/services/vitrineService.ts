import api from './api';
import { Vitrine } from '../types';
import { toFormData } from '../utils/formDataHelper';

const hasFiles = (data: any) => {
    return Object.values(data).some(value => {
        // Un simple string qui est une URI locale
        if (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://') || value.startsWith('blob:'))) {
            return true;
        }
        // Un objet avec une propriété uri qui est une URI locale
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const v = value as any;
            if (typeof v.uri === 'string' && (v.uri.startsWith('file://') || v.uri.startsWith('content://') || v.uri.startsWith('blob:'))) {
                return true;
            }
        }
        // Un tableau contenant des strings ou des objets avec URI locale
        if (Array.isArray(value)) {
            return value.some(v => {
                const uri = (typeof v === 'string') ? v : (v && typeof v === 'object' ? v.uri : null);
                return typeof uri === 'string' && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('blob:'));
            });
        }
        return false;
    });
};

export const vitrineService = {
    // Importation de l'instance d'Axios configurée (`api`) et du type de donnée `Vitrine`.
    // Définition de l'objet `vitrineService` qui regroupe les fonctions d'interaction avec l'API des vitrines.

    getAllVitrines: async (page = 1, limit = 6, category = '', search = '') => {
        const response = await api.get<{ success: boolean; vitrines: Vitrine[] }>(
            `/vitrines?page=${page}&limit=${limit}&category=${category || ''}&search=${search || ''}`
        );
        return response.data;
    },

    getAllOwnerVitrines: async () => {
        const response = await api.get<{ success: boolean; vitrines: Vitrine[] }>('/vitrines/myvitrines');
        return response.data.vitrines;
    },
    // Fonction pour récupérer toutes les vitrines appartenant à l'utilisateur authentifié. Retourne le tableau des vitrines.

    getVitrineBySlug: async (slug: string) => {
        const response = await api.get<{ success: boolean; vitrine: Vitrine }>(`/vitrines/${slug}`);
        return response.data.vitrine;
    },
    // Fonction pour récupérer une vitrine spécifique en utilisant son slug. Retourne l'objet vitrine.

    createVitrine: async (data: Partial<Vitrine>) => {
        const payload = hasFiles(data) ? toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.post<Vitrine>('/vitrines', payload, config);
        return response.data;
    },
    // Fonction pour créer une nouvelle vitrine (`POST`). Prend les données partielles et retourne la vitrine créée.

    updateVitrine: async (slug: string, data: Partial<Vitrine>) => {
        const payload = hasFiles(data) ? toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.patch<{ success: boolean; vitrine: Vitrine }>(
            `/vitrines/myvitrine/${slug}`,
            payload,
            config
        );
        return response.data.vitrine;
    },
    // Fonction pour modifier une vitrine existante par son slug (`PATCH`). Prend les données de mise à jour et retourne la vitrine modifiée.

    deleteVitrine: async (slug: string) => {
        const response = await api.delete(`/vitrines/myvitrine/${slug}`);
        return response.data;
    },
    // Fonction pour supprimer une vitrine par son slug (`DELETE`).
};
// L'objet `vitrineService` fournit l'ensemble des méthodes CRUD et de lecture de données pour l'entité Vitrine.