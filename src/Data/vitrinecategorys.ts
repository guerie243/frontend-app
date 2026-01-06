import { Ionicons } from '@expo/vector-icons';

/**
 * Interface définissant la structure d'une catégorie.
 * - name: Nom affiché.
 * - slug: Identifiant unique pour le filtrage API.
 * - iconName: Nom de l'icône Ionicons.
 */
export interface CategoryAnnonce {
    name: string;
    slug: string;
    iconName: keyof typeof Ionicons.glyphMap;
}

/**
 * Liste des CATEGORIES_VITRINE.
 * Fichier de référence pour les catégories affichées sur la page d'accueil.
 */
export const CATEGORIES_VITRINE: CategoryAnnonce[] = [
    {
        name: 'Tout',
        slug: 'all',
        iconName: 'grid-outline'
    },
    {
        name: 'Boutique',
        slug: 'Boutique',
        iconName: 'storefront-outline'
    },
    {
        name: 'Restaurant',
        slug: 'Restaurant',
        iconName: 'restaurant-outline'
    },
    {
        name: 'Hôtel',
        slug: 'Hôtel',
        iconName: 'bed-outline'
    },
    {
        name: 'Services',
        slug: 'Services',
        iconName: 'briefcase-outline'
    },
    {
        name: 'Digital',
        slug: 'Digital',
        iconName: 'phone-portrait-outline'
    },
    {
        name: 'Mode',
        slug: 'Mode',
        iconName: 'shirt-outline'
    },
];
