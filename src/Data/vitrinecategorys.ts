// src/data/vitrinecategorys.ts

/**
 * Interface définissant la structure d'une catégorie.
 * - name: Nom affiché.
 * - slug: Identifiant unique pour le filtrage API.
 * - imageUri: Lien vers l'icône/image.
 */
export interface CategoryAnnonce {
    name: string;
    slug: string;
    imageUri: string;
}

/**
 * Liste des CATEGORIES_VITRINE.
 * Fichier de référence pour les catégories affichées sur la page d'accueil.
 */
export const CATEGORIES_VITRINE: CategoryAnnonce[] = [
    {
        name: 'Tout',
        slug: 'all',
        imageUri: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=All'
    },
    {
        name: 'Boutique',
        slug: 'Boutique',
        imageUri: 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=Boutique'
    },
    {
        name: 'Restaurant',
        slug: 'Restaurant',
        imageUri: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=Resto'
    },
    {
        name: 'Hôtel',
        slug: 'Hôtel',
        imageUri: 'https://via.placeholder.com/150/800080/FFFFFF?text=Hotel'
    },
    {
        name: 'Services',
        slug: 'Services',
        imageUri: 'https://via.placeholder.com/150/00FFFF/000000?text=Service'
    },
    {
        name: 'Mode',
        slug: 'Mode',
        imageUri: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Mode'
    },
    {
        name: 'High-Tech',
        slug: 'High-Tech',
        imageUri: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Tech'
    },
    {
        name: 'Immobilier',
        slug: 'Immobilier',
        imageUri: 'https://via.placeholder.com/150/FFFF00/000000?text=House'
    },
    {
        name: 'Sports & Loisirs',
        slug: 'Sports',
        imageUri: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Sport'
    },
];
