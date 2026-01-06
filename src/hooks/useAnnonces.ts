import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { annonceService } from '../services/annonceService';
import { Annonce } from '../types';

export const annonceKeys = {
    all: ['annonces'] as const,
    lists: () => [...annonceKeys.all, 'list'] as const,
    list: (filters: any) => [...annonceKeys.lists(), filters] as const,
    feeds: () => [...annonceKeys.all, 'feed'] as const,
    feed: (filters: any) => [...annonceKeys.feeds(), filters] as const,
    details: () => [...annonceKeys.all, 'detail'] as const,
    detail: (slug: string) => [...annonceKeys.details(), slug] as const,
    byVitrine: (vitrineSlug: string) => [...annonceKeys.all, 'vitrine', vitrineSlug] as const,
};

export const useAnnonces = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<Annonce>) => annonceService.createAnnonce(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: annonceKeys.all });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ slug, data }: { slug: string; data: Partial<Annonce> }) =>
            annonceService.updateAnnonce(slug, data),
        onSuccess: (updatedAnnonce) => {
            queryClient.invalidateQueries({ queryKey: annonceKeys.all });
            queryClient.setQueryData(annonceKeys.detail(updatedAnnonce.slug), updatedAnnonce);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => annonceService.deleteAnnonce(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: annonceKeys.all });
        }
    });

    // Keeping the original structure for compatibility where needed, 
    // but these functions are now just wrappers around React Query.
    // Note: Use the specialized hooks below for list/detail fetching for full benefits.

    return {
        createAnnonce: createMutation.mutateAsync,
        updateAnnonce: (slug: string, data: Partial<Annonce>) => updateMutation.mutateAsync({ slug, data }),
        deleteAnnonce: deleteMutation.mutateAsync,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        // For compatibility, but should be replaced by useAnnonceDetail in screens
        fetchAnnonceBySlug: (slug: string) => queryClient.fetchQuery({
            queryKey: annonceKeys.detail(slug),
            queryFn: () => annonceService.getAnnonceBySlug(slug)
        }),
        // For compatibility, will be replaced by useAnnonceFeed and useAnnoncesByVitrine
        fetchFeed: (page: number, limit: number, categoryId?: string, search?: string) =>
            annonceService.getFeed(page, limit, categoryId, search),
        fetchAnnoncesByVitrine: (vitrineSlug: string, page: number, limit: number) =>
            annonceService.getAnnoncesByVitrine(vitrineSlug, page, limit),
    };
};

export const useAnnonceFeed = (limit = 20, categoryId?: string | null, search?: string | null) => {
    return useInfiniteQuery({
        queryKey: annonceKeys.feed({ categoryId, search, limit }),
        queryFn: ({ pageParam = 1 }) => annonceService.getFeed(pageParam, limit, categoryId || undefined, search || undefined),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNextPage) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        }
    });
};

export const useAnnoncesByVitrine = (vitrineSlug: string, limit = 10) => {
    return useInfiniteQuery({
        queryKey: annonceKeys.byVitrine(vitrineSlug),
        queryFn: ({ pageParam = 1 }) => annonceService.getAnnoncesByVitrine(vitrineSlug, pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === limit) {
                return allPages.length + 1;
            }
            return undefined;
        }
    });
};

export const useAnnonceDetail = (slug: string) => {
    return useQuery({
        queryKey: annonceKeys.detail(slug),
        queryFn: () => annonceService.getAnnonceBySlug(slug),
        enabled: !!slug
    });
};
