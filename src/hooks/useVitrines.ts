import { useState, useCallback } from 'react';
import { vitrineService } from '../services/vitrineService';
import { Vitrine } from '../types';

export const useVitrines = () => {
    const [vitrines, setVitrines] = useState<Vitrine[]>([]);
    const [currentVitrine, setCurrentVitrine] = useState<Vitrine | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyVitrines = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await vitrineService.getAllOwnerVitrines();
            setVitrines(data);
            if (data.length > 0) {
                setCurrentVitrine(prev => prev || data[0]);
            } else {
                setCurrentVitrine(null);
            }
            return data;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch vitrines';
            setError(errorMsg);
            console.error('Error in fetchMyVitrines:', errorMsg, err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchVitrineBySlug = useCallback(async (slug: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await vitrineService.getVitrineBySlug(slug);
            setCurrentVitrine(data);
            // Mettre à jour aussi dans la liste si elle existe
            setVitrines(prevVitrines => {
                const index = prevVitrines.findIndex(v => v.slug === slug);
                if (index !== -1) {
                    const updated = [...prevVitrines];
                    updated[index] = data;
                    return updated;
                }
                return prevVitrines;
            });
            return data;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch vitrine';
            setError(errorMsg);
            console.error('Error in fetchVitrineBySlug:', errorMsg, err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createVitrine = useCallback(async (data: Partial<Vitrine>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newVitrine = await vitrineService.createVitrine(data);
            setVitrines(prev => [newVitrine, ...prev]);
            setCurrentVitrine(newVitrine);
            return newVitrine;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to create vitrine';
            setError(errorMsg);
            console.error('Error in createVitrine:', errorMsg, err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateVitrine = useCallback(async (slug: string, updates: Partial<Vitrine>) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Updating vitrine with:', { slug, updates });
            const updatedVitrine = await vitrineService.updateVitrine(slug, updates);

            // Récupérer le nouveau slug si il a changé
            const newSlug = updatedVitrine.slug;
            const slugChanged = newSlug !== slug;

            // Mise à jour de la liste des vitrines
            setVitrines(prevVitrines => {
                if (slugChanged) {
                    // Si le slug a changé, remplacer l'ancienne entrée par la nouvelle
                    return prevVitrines.map(v =>
                        v.slug === slug ? updatedVitrine : v
                    );
                } else {
                    // Sinon, mettre à jour normalement
                    return prevVitrines.map(v =>
                        v.slug === slug ? updatedVitrine : v
                    );
                }
            });

            // Mise à jour de la vitrine courante
            setCurrentVitrine(prev => {
                if (prev?.slug === slug || prev?.slug === newSlug) {
                    return updatedVitrine;
                }
                return prev;
            });

            console.log('Vitrine updated successfully:', updatedVitrine);
            return updatedVitrine;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to update vitrine';
            console.error('Error in updateVitrine:', errorMsg, err);
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteVitrine = useCallback(async (slug: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await vitrineService.deleteVitrine(slug);
            setVitrines(prev => prev.filter(v => v.slug !== slug));
            setCurrentVitrine(prev => prev?.slug === slug ? null : prev);
            return true;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to delete vitrine';
            setError(errorMsg);
            console.error('Error in deleteVitrine:', errorMsg, err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        vitrines,
        currentVitrine,
        isLoading,
        error,
        fetchMyVitrines,
        fetchVitrineBySlug,
        createVitrine,
        updateVitrine,
        deleteVitrine,
    };
};
