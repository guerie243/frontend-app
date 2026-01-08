import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vitrineService } from '../services/vitrineService';
import { Vitrine } from '../types';

export const vitrineKeys = {
    all: ['vitrines'] as const,
    mine: () => [...vitrineKeys.all, 'mine'] as const,
    details: () => [...vitrineKeys.all, 'detail'] as const,
    detail: (slug: string) => [...vitrineKeys.details(), slug] as const,
    lists: () => [...vitrineKeys.all, 'list'] as const,
    list: (filters: any) => [...vitrineKeys.lists(), filters] as const,
};

export const useVitrines = (options?: { enabled?: boolean }) => {
    const queryClient = useQueryClient();

    // Query pour les vitrines de l'utilisateur (utilisée reactivement par bcp d'écrans)
    const myVitrinesQuery = useQuery({
        queryKey: vitrineKeys.mine(),
        queryFn: () => vitrineService.getAllOwnerVitrines(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Vitrine>) => vitrineService.createVitrine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vitrineKeys.all });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ slug, updates }: { slug: string; updates: Partial<Vitrine> }) =>
            vitrineService.updateVitrine(slug, updates),
        onSuccess: (updatedAnnonce) => {
            queryClient.invalidateQueries({ queryKey: vitrineKeys.all });
            queryClient.setQueryData(vitrineKeys.detail(updatedAnnonce.slug), updatedAnnonce);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => vitrineService.deleteVitrine(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vitrineKeys.all });
        }
    });

    // Compatibility layer
    return {
        // État de la query (Data & Error)
        vitrines: myVitrinesQuery.data,
        error: myVitrinesQuery.error ? (myVitrinesQuery.error as any).message : null,

        // Mutations
        createVitrine: createMutation.mutateAsync,
        updateVitrine: (slug: string, updates: Partial<Vitrine>) => updateMutation.mutateAsync({ slug, updates }),
        deleteVitrine: deleteMutation.mutateAsync,

        // États combinés
        // Si la query est désactivée, on ne considère pas qu'on est en chargement "bloquant"
        isLoading: (myVitrinesQuery.fetchStatus === 'fetching' && myVitrinesQuery.isLoading) || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

        // Fonctions de fetch (Impératif)
        fetchMyVitrines: () => queryClient.fetchQuery({
            queryKey: vitrineKeys.mine(),
            queryFn: () => vitrineService.getAllOwnerVitrines()
        }),
        fetchVitrineBySlug: (slug: string) => queryClient.fetchQuery({
            queryKey: vitrineKeys.detail(slug),
            queryFn: () => vitrineService.getVitrineBySlug(slug)
        }),
    };
};

export const useMyVitrines = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: vitrineKeys.mine(),
        queryFn: () => vitrineService.getAllOwnerVitrines(),
        ...options
    });
};

export const useVitrineDetail = (slug: string) => {
    return useQuery({
        queryKey: vitrineKeys.detail(slug),
        queryFn: () => vitrineService.getVitrineBySlug(slug),
        enabled: !!slug
    });
};

export const useAllVitrines = (page = 1, limit = 10, categoryId?: string, search?: string) => {
    return useQuery({
        queryKey: vitrineKeys.list({ page, limit, categoryId, search }),
        queryFn: () => vitrineService.getAllVitrines(page, limit, categoryId, search)
    });
};
