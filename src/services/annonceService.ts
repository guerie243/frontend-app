import api from './api';
import { Annonce } from '../types';
import { toFormData } from '../utils/formDataHelper';

const hasFiles = (data: any) => {
    return Object.values(data).some(value =>
        (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://'))) ||
        (Array.isArray(value) && value.some(v => typeof v === 'string' && (v.startsWith('file://') || v.startsWith('content://'))))
    );
};

export const annonceService = {
    // Importation de l'instance d'Axios configurée (`api`) et du type de donnée `Annonce`.
    // Définition de l'objet `annonceService` qui regroupe les fonctions d'interaction avec l'API des annonces.

    getAnnoncesByVitrine: async (vitrineSlug: string, page = 1, limit = 10) => {
        const response = await api.get<{ success: boolean; annonces: Annonce[] }>(`/annonces/vitrine/${vitrineSlug}?page=${page}&limit=${limit}`);
        return response.data.annonces;
    },
    // Fonction asynchrone pour récupérer la liste des annonces associées à un slug de vitrine donné. Retourne le tableau des annonces.

    getAnnonceBySlug: async (slug: string) => {
        const response = await api.get<{ success: boolean; annonce: Annonce }>(`/annonces/${slug}`);
        return response.data.annonce;
    },
    // Fonction pour récupérer une seule annonce en utilisant son slug. Retourne l'objet annonce.

    createAnnonce: async (data: Partial<Annonce>) => {
        const payload = hasFiles(data) ? toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.post<{ success: boolean; annonce: Annonce }>('/annonces', payload, config);
        return response.data.annonce;
    },
    // Fonction pour créer une nouvelle annonce (`POST`). Prend les données partielles en entrée et retourne l'annonce créée.

    updateAnnonce: async (slug: string, data: Partial<Annonce>) => {
        const payload = hasFiles(data) ? toFormData(data) : data;
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
};
// L'objet `annonceService` fournit l'ensemble des méthodes CRUD et de lecture de données pour l'entité Annonce.