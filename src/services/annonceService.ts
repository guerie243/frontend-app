import api from './api';
import { Annonce } from '../types';
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

export const annonceService = {
    // Importation de l'instance d'Axios configurée (`api`) et du type de donnée `Annonce`.
    // Définition de l'objet `annonceService` qui regroupe les fonctions d'interaction avec l'API des annonces.

    getAnnoncesByVitrine: async (vitrineIdOrSlug: string, page = 1, limit = 10) => {
        const response = await api.get<{ success: boolean; annonces: Annonce[] }>(`/annonces/vitrine/${vitrineIdOrSlug}?page=${page}&limit=${limit}`);
        return response.data.annonces;
    },
    // Fonction asynchrone pour récupérer la liste des annonces associées à un slug de vitrine donné. Retourne le tableau des annonces.

    getAnnonceBySlug: async (slug: string) => {
        const response = await api.get<{ success: boolean; annonce: Annonce }>(`/annonces/${slug}`);
        return response.data.annonce;
    },
    // Fonction pour récupérer une seule annonce en utilisant son slug. Retourne l'objet annonce.

    createAnnonce: async (data: Partial<Annonce>) => {
        const payload = hasFiles(data) ? await toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.post<{ success: boolean; annonce: Annonce }>('/annonces', payload, config);
        return response.data.annonce;
    },
    // Fonction pour créer une nouvelle annonce (`POST`). Prend les données partielles en entrée et retourne l'annonce créée.

    updateAnnonce: async (slug: string, data: Partial<Annonce>) => {
        const payload = hasFiles(data) ? await toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.patch<{ success: boolean; annonce: Annonce }>(`/annonces/${slug}`, payload, config);
        return response.data.annonce;
    },
    // Fonction pour modifier une annonce existante par son slug (`PATCH`). Prend les données de mise à jour et retourne l'annonce modifiée.

    deleteAnnonce: async (slug: string) => {
        const response = await api.delete(`/annonces/${slug}`);
        return response.data;
    },
    // Fonction pour supprimer une annonce par son slug (`DELETE`).

    getFeed: async (page = 1, limit = 20, categoryId?: string, search?: string) => {
        let url = `/annonces/feed?page=${page}&limit=${limit}`;
        if (categoryId) url += `&categorieId=${categoryId}`;
        if (search) url += `&recherche=${encodeURIComponent(search)}`;

        const response = await api.get<{ success: boolean; data: Annonce[]; pagination: any }>(url);
        return response.data;
    },
    // Fonction pour récupérer un flux général d'annonces paginées. Utilise des paramètres par défaut pour la page et la limite.

    likeAnnonce: async (slug: string) => {
        const response = await api.post<{ success: boolean; annonce: Annonce }>(`/annonces/${slug}/like`);
        return response.data.annonce;
    },
    // Fonction pour ajouter un like à une annonce. Retourne l'annonce mise à jour avec le nouveau compteur.

    unlikeAnnonce: async (slug: string) => {
        const response = await api.delete<{ success: boolean; annonce: Annonce }>(`/annonces/${slug}/like`);
        return response.data.annonce;
    },
    // Fonction pour retirer un like d'une annonce. Retourne l'annonce mise à jour avec le nouveau compteur.
};
// L'objet `annonceService` fournit l'ensemble des méthodes CRUD et de lecture de données pour l'entité Annonce.