export interface User {
    userId: string;
    username: string;
    email?: string;
    profileName: string;
    phoneNumber?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Vitrine {
    vitrineId: string;
    ownerId: string;
    slug: string;
    name: string;
    description?: string;
    type: string; // Backend uses 'type', not 'category'
    category?: string; // Keep for backward compatibility
    avatar?: string; // Backend uses 'avatar', not 'logo'
    logo?: string; // Keep for backward compatibility
    coverImage?: string; // Backend uses 'coverImage', not 'banner'
    banner?: string; // Keep for backward compatibility
    address?: string; // Physical address
    contact?: {
        email?: string;
        phone?: string;
        whatsappLink?: string;
    };
    createdAt: string;
    updatedAt?: string;
}

export interface Annonce {
    annonceId: string;
    ownerId: string;
    vitrineId: string;
    vitrineSlug: string;
    slug: string;
    title: string;
    description?: string;
    price: number;
    currency?: string; // Ajout du champ currency
    category?: string; // Ajout du champ category
    link?: string; // Ajout du champ link
    images: string[];
    locations?: string[]; // Ajout du champ locations
    likes_count?: number; // Compteur de likes (optionnel pour rétrocompatibilité)
    createdAt: string;
    updatedAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token: string;
    user: User;
}

export interface ApiError {
    success: false;
    message: string;
}
