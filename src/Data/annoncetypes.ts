// src/data/annoncetypes.ts (CODE CORRIGÉ)

import { SelectOption } from "../components/AnimatedSelect";

export interface SelectSection {
    slug: string;
    title: string;
    data: SelectOption[];
}

/**
 * Interface définissant la structure d'un Type d'Article/Service.
 */
export interface AnnonceType {
    slug: string;
    name: string;
    parentCategorySlug: string;
}

// Placeholder pour obtenir le nom lisible de la catégorie parente.
const PARENT_CATEGORIES_MAP: Record<string, string> = {
    'fashion': 'Mode & Vêtements',
    'high-tech': 'High-Tech & Électronique',
    'real-estate': 'Immobilier',
    'sports': 'Sports & Loisirs',
    'services': 'Services Personnels & Professionnels',
    'digital': 'Digital & Produits Virtuels',
    'food': 'Aliments & Boissons',
    // ... ajoutez d'autres catégories parentes si nécessaire
};


/**
 * Liste exhaustive des TYPES D'ANNONCES que l'utilisateur peut choisir.
 */
export const ANNONCE_TYPES_DISPONIBLES: AnnonceType[] = [
    // --- Mode (parentCategorySlug: 'fashion') ---
    { slug: 't-shirt-polo', name: 'T-shirts & Polos', parentCategorySlug: 'fashion' },
    { slug: 'chemises-blouses', name: 'Chemises & Blouses', parentCategorySlug: 'fashion' },
    { slug: 'pantalons-jeans', name: 'Pantalons & Jeans', parentCategorySlug: 'fashion' },
    { slug: 'robes-jupes', name: 'Robes & Jupes', parentCategorySlug: 'fashion' },
    { slug: 'chaussures-ville', name: 'Chaussures de ville', parentCategorySlug: 'fashion' },
    { slug: 'accessoires-mode', name: 'Sacs & Accessoires', parentCategorySlug: 'fashion' },

    // --- High-Tech (parentCategorySlug: 'high-tech') ---
    { slug: 'smartphone', name: 'Téléphone Mobile', parentCategorySlug: 'high-tech' },
    { slug: 'tablette', name: 'Tablette tactile', parentCategorySlug: 'high-tech' },
    { slug: 'ordinateur-portable', name: 'Ordinateur Portable', parentCategorySlug: 'high-tech' },
    { slug: 'ordinateur-bureau', name: 'Ordinateur de Bureau', parentCategorySlug: 'high-tech' },
    { slug: 'ecrans-moniteurs', name: 'Écrans & Moniteurs', parentCategorySlug: 'high-tech' },
    { slug: 'consoles-jeux', name: 'Consoles de Jeux Vidéo', parentCategorySlug: 'high-tech' },
    { slug: 'accessoires-pc', name: 'Claviers, Souris, Périphériques', parentCategorySlug: 'high-tech' },

    // --- Immobilier (parentCategorySlug: 'real-estate') ---
    { slug: 'vente-maison', name: 'Maison (Vente)', parentCategorySlug: 'real-estate' },
    { slug: 'vente-appartement', name: 'Appartement (Vente)', parentCategorySlug: 'real-estate' },
    { slug: 'location-maison', name: 'Maison (Location)', parentCategorySlug: 'real-estate' },
    { slug: 'location-appartement', name: 'Appartement (Location)', parentCategorySlug: 'real-estate' },
    { slug: 'terrain', name: 'Terrain', parentCategorySlug: 'real-estate' },
    { slug: 'bureaux-commerces', name: 'Bureaux & Commerces', parentCategorySlug: 'real-estate' },

    // --- Sports & Loisirs (parentCategorySlug: 'sports') ---
    { slug: 'equipement-fitness', name: 'Équipement Fitness/Musculation', parentCategorySlug: 'sports' },
    { slug: 'velos', name: 'Vélos & Trottinettes', parentCategorySlug: 'sports' },
    { slug: 'instruments-musique', name: 'Instruments de Musique', parentCategorySlug: 'sports' },
    { slug: 'jeux-societe', name: 'Jeux de Société & Cartes', parentCategorySlug: 'sports' },
    { slug: 'camping-randonnee', name: 'Matériel de Camping & Randonnée', parentCategorySlug: 'sports' },

    // --- Services (parentCategorySlug: 'services') ---
    { slug: 'cours-soutien', name: 'Cours et Soutien Scolaire', parentCategorySlug: 'services' },
    { slug: 'bricolage-reparation', name: 'Bricolage & Réparation', parentCategorySlug: 'services' },
    { slug: 'demenagement-transport', name: 'Déménagement & Transport', parentCategorySlug: 'services' },
    { slug: 'web-graphisme', name: 'Développement Web & Graphisme', parentCategorySlug: 'services' },
    { slug: 'garde-enfants', name: 'Garde d\'enfants', parentCategorySlug: 'services' },

    // --- Digital (parentCategorySlug: 'digital') ---
    { slug: 'application', name: 'Application & Logiciel', parentCategorySlug: 'digital' },
    { slug: 'ebook', name: 'E-book & Document', parentCategorySlug: 'digital' },
    { slug: 'formation', name: 'Formation & Cours en ligne', parentCategorySlug: 'digital' },
    { slug: 'abonnement', name: 'Abonnement & Service Digital', parentCategorySlug: 'digital' },

    // --- Aliments/Nourriture (parentCategorySlug: 'food') ---
    { slug: 'produits-frais', name: 'Produits Frais (Fruits, Légumes, etc.)', parentCategorySlug: 'food' },
    { slug: 'boissons-alcoolisees', name: 'Boissons (non/alcoolisées)', parentCategorySlug: 'food' },
    { slug: 'plats-prepares', name: 'Plats et Traiteur', parentCategorySlug: 'food' },
];

/**
 * Fonction d'aide pour transformer la liste plate AnnonceType[] en SelectSection[] groupé.
 * @param types La liste plate des types d'annonces.
 * @returns Le tableau structuré pour SectionedSelect.
 */
export const groupAnnonceTypes = (types: AnnonceType[]): SelectSection[] => {
    // 1. Groupement par parentCategorySlug
    const grouped = types.reduce((acc, currentType) => {
        const key = currentType.parentCategorySlug;

        // Transforme AnnonceType en SelectOption
        const option: SelectOption = {
            slug: currentType.slug,
            name: currentType.name,
            imageUri: null,
        };

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(option);
        return acc;
    }, {} as Record<string, SelectOption[]>);

    // 2. Transformation en tableau de SelectSection
    return Object.keys(grouped).map(slug => ({
        slug: slug,
        // Utilise la map pour obtenir le nom lisible, sinon utilise le slug
        title: PARENT_CATEGORIES_MAP[slug] || slug.replace(/-/g, ' ').toUpperCase(),
        // CLÉ CORRIGÉE : on utilise 'data'
        data: grouped[slug],
    }));
};

/**
 * EXPORTATION DE LA LISTE FORMATÉE
 */
export const ANNONCE_CATEGORIES_FORMATTED = groupAnnonceTypes(ANNONCE_TYPES_DISPONIBLES);