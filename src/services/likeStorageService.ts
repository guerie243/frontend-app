import { storage } from '../utils/storage';

/**
 * Service de gestion du stockage local des likes
 * Compatible web (localStorage) et mobile (SecureStore)
 */

const STORAGE_KEY = 'liked_annonces';

export interface LikedAnnonces {
    [annonceId: string]: boolean;
}

export const likeStorageService = {
    /**
     * Récupère toutes les annonces likées
     */
    async getLikedAnnonces(): Promise<LikedAnnonces> {
        try {
            const data = await storage.getItem(STORAGE_KEY);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading liked annonces from storage:', error);
            return {};
        }
    },

    /**
     * Vérifie si une annonce est likée
     */
    async isAnnonceLiked(annonceId: string): Promise<boolean> {
        try {
            const likedAnnonces = await this.getLikedAnnonces();
            return !!likedAnnonces[annonceId];
        } catch (error) {
            console.error('Error checking if annonce is liked:', error);
            return false;
        }
    },

    /**
     * Ajoute une annonce aux likes
     */
    async addLikedAnnonce(annonceId: string): Promise<void> {
        try {
            const likedAnnonces = await this.getLikedAnnonces();
            likedAnnonces[annonceId] = true;
            await storage.setItem(STORAGE_KEY, JSON.stringify(likedAnnonces));
        } catch (error) {
            console.error('Error adding liked annonce to storage:', error);
        }
    },

    /**
     * Retire une annonce des likes
     */
    async removeLikedAnnonce(annonceId: string): Promise<void> {
        try {
            const likedAnnonces = await this.getLikedAnnonces();
            delete likedAnnonces[annonceId];
            await storage.setItem(STORAGE_KEY, JSON.stringify(likedAnnonces));
        } catch (error) {
            console.error('Error removing liked annonce from storage:', error);
        }
    },
};
