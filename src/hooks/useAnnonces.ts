import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { annonceService } from '../services/annonceService';
import { Annonce } from '../types';

export const useAnnonces = () => {
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [currentAnnonce, setCurrentAnnonce] = useState<Annonce | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchAnnoncesByVitrine = useCallback(async (vitrineSlug: string, page = 1, limit = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await annonceService.getAnnoncesByVitrine(vitrineSlug, page, limit);
            if (page === 1) {
                setAnnonces(data);
            } else {
                setAnnonces((prev) => [...prev, ...data]);
            }
            setHasMore(data.length === limit);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch annonces');
            console.error(err);
            setHasMore(false); // Stop loop on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAnnonceBySlug = useCallback(async (slug: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await annonceService.getAnnonceBySlug(slug);
            setCurrentAnnonce(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch annonce');
            console.error(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createAnnonce = async (data: Partial<Annonce>) => {
        setIsLoading(true);
        try {
            const newAnnonce = await annonceService.createAnnonce(data);
            setAnnonces((prev) => [newAnnonce, ...prev]);
            return newAnnonce;
        } catch (err: any) {
            setError(err.message || 'Failed to create annonce');
            Alert.alert('Error', 'Failed to create annonce');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateAnnonce = async (slug: string, data: Partial<Annonce>) => {
        setIsLoading(true);
        try {
            const updatedAnnonce = await annonceService.updateAnnonce(slug, data);
            setAnnonces((prev) => prev.map((a) => (a.slug === slug ? updatedAnnonce : a)));
            setCurrentAnnonce(updatedAnnonce);
            return updatedAnnonce;
        } catch (err: any) {
            setError(err.message || 'Failed to update annonce');
            Alert.alert('Error', 'Failed to update annonce');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAnnonce = async (slug: string) => {
        setIsLoading(true);
        try {
            await annonceService.deleteAnnonce(slug);
            setAnnonces((prev) => prev.filter((a) => a.slug !== slug));
        } catch (err: any) {
            setError(err.message || 'Failed to delete annonce');
            Alert.alert('Error', 'Failed to delete annonce');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFeed = useCallback(async (page = 1, limit = 20, categoryId?: string, search?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await annonceService.getFeed(page, limit, categoryId, search);
            if (page === 1) {
                setAnnonces(response.data || []);
            } else {
                setAnnonces((prev) => [...prev, ...(response.data || [])]);
            }
            setHasMore(response?.pagination?.hasNextPage || false);
            return response;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch feed';
            setError(errorMsg);
            console.error('Error in fetchFeed:', errorMsg, err);
            setHasMore(false); // Stop loop on error
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        annonces,
        currentAnnonce,
        isLoading,
        error,
        hasMore,
        fetchAnnoncesByVitrine,
        fetchAnnonceBySlug,
        fetchFeed,
        createAnnonce,
        updateAnnonce,
        deleteAnnonce,
    };
};
