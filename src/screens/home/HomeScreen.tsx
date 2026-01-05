import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductFeedCard } from '../../components/ProductFeedCard';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAnnonces } from '../../hooks/useAnnonces';

// Composants
import { CategoryPill } from '../../components/CategoryPill';
import { LoadingComponent } from '../../components/LoadingComponent';
import { StateMessage } from '../../components/StateMessage';
import ImageCarousel from '../../components/ImageCarousel';
import { SearchBar } from '../../components/SearchBar';
import { VitrineScrollBlock } from '../../components/VitrineScrollBlock';
import { Ionicons } from '@expo/vector-icons';

// Services
import { ENV } from '../../config/env';
import { vitrineService } from '../../services/vitrineService';
import { Vitrine } from '../../types';

// Données
import { CATEGORIES_VITRINE } from '../../Data/vitrinecategorys';

const SCREEN_WIDTH = Dimensions.get('window').width;

// LIGNE POUR MODIFIER L'ESPACE HORIZONTAL AUTOUR DE LA BANNIÈRE
const CAROUSEL_PADDING_HORIZONTAL = 0;


export const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { annonces, fetchFeed, isLoading, error, hasMore } = useAnnonces();
    const isFocused = useIsFocused();
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);

    // Recherche et Filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    // Vitrines
    const [vitrines, setVitrines] = useState<Vitrine[]>([]);
    const [isLoadingVitrines, setIsLoadingVitrines] = useState(false);

    const categories = CATEGORIES_VITRINE;
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.slug || '');

    const flatListRef = React.useRef<FlatList>(null);
    const lastOffsetY = React.useRef(0);

    // --- Logique de Chargement (Identique) ---
    const loadFeed = useCallback(async (pageNum: number, categoryId?: string | null, search?: string) => {
        try {
            const catParam = categoryId !== undefined ? categoryId : activeCategoryId;
            const searchParam = search !== undefined ? search : activeSearchQuery;
            await fetchFeed(pageNum, 20, catParam || undefined, searchParam || undefined);
            setPage(pageNum);
        } catch (err) {
            console.error('Error loading feed:', err);
        }
    }, [fetchFeed, activeCategoryId, activeSearchQuery]);

    useEffect(() => {
        const params = route.params as any;
        if (params?.refreshTimestamp) {
            setPage(1);
            loadFeed(1, activeCategoryId, activeSearchQuery);
            // Optionnel: Scroll to top on refresh
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    }, [route.params, loadFeed, activeCategoryId, activeSearchQuery]);


    const handleScroll = (event: any) => {
        const currentOffsetY = event.nativeEvent.contentOffset.y;
        const isScrollingUp = currentOffsetY < lastOffsetY.current;

        if (isScrollingUp && currentOffsetY > 300) {
            setShowScrollTopButton(true);
        } else {
            setShowScrollTopButton(false);
        }
        lastOffsetY.current = currentOffsetY;
    };

    const scrollToTop = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    // Navigation
    const handleGoToAnnonceDetail = useCallback((slug: string) => (navigation as any).navigate('AnnonceDetail', { slug }), [navigation]);
    const handleGoToVitrine = useCallback((slug: string) => (navigation as any).navigate('VitrineDetail', { slug }), [navigation]);
    const handleGoToVitrineList = useCallback(() => (navigation as any).navigate('VitrineList', {
        category: activeCategoryId,
        search: activeSearchQuery
    }), [navigation, activeCategoryId, activeSearchQuery]);

    // Charger les vitrines
    const loadVitrines = useCallback(async (categoryId?: string | null, search?: string) => {
        setIsLoadingVitrines(true);
        try {
            const catParam = categoryId !== undefined ? categoryId : activeCategoryId;
            const searchParam = search !== undefined ? search : activeSearchQuery;
            const result = await vitrineService.getAllVitrines(1, 6, catParam || undefined, searchParam || undefined);
            setVitrines(result.vitrines);
        } catch (err) {
            console.error('Error loading vitrines:', err);
        } finally {
            setIsLoadingVitrines(false);
        }
    }, [activeCategoryId, activeSearchQuery]);

    useEffect(() => {
        if (isFocused) {
            loadFeed(1, activeCategoryId, activeSearchQuery);
            loadVitrines(activeCategoryId, activeSearchQuery);
        }
    }, [isFocused, loadFeed, loadVitrines]);

    const filterBySearch = useCallback(async (query: string) => {
        const rawQuery = (query || '').trim();
        const cleanQuery = rawQuery.toLowerCase();
        if (!cleanQuery) return;

        // --- DÉTECTION D'URL / LIENS ANDY ---
        const shareUrl = (ENV.SHARE_BASE_URL || 'https://andy.com').toLowerCase();
        const isUrl = cleanQuery.includes(shareUrl.replace('https://', '').replace('http://', ''));
        const isAnnoncePath = cleanQuery.includes('/a/') || cleanQuery.startsWith('a/');
        const isVitrinePath = cleanQuery.includes('/v/') || cleanQuery.startsWith('v/');

        if (isUrl || isAnnoncePath || isVitrinePath) {
            // Extraction du slug (on utilise rawQuery pour préserver les majuscules des slugs existants)

            // 1. ANNONCE
            if (cleanQuery.includes('/a/') || cleanQuery.startsWith('a/')) {
                let extractedSlug = '';
                if (cleanQuery.includes('/a/')) {
                    extractedSlug = rawQuery.split(/\/a\//i)[1];
                } else if (cleanQuery.startsWith('a/')) {
                    extractedSlug = rawQuery.replace(/^a\//i, '');
                }

                if (extractedSlug) {
                    const finalSlug = extractedSlug.split('?')[0].split('#')[0].trim();
                    if (finalSlug) {
                        handleGoToAnnonceDetail(finalSlug);
                        setSearchQuery('');
                        return;
                    }
                }
            }

            // 2. VITRINE
            if (cleanQuery.includes('/v/') || cleanQuery.startsWith('v/')) {
                let extractedSlug = '';
                if (cleanQuery.includes('/v/')) {
                    extractedSlug = rawQuery.split(/\/v\//i)[1];
                } else if (cleanQuery.startsWith('v/')) {
                    extractedSlug = rawQuery.replace(/^v\//i, '');
                }

                if (extractedSlug) {
                    const finalSlug = extractedSlug.split('?')[0].split('#')[0].trim();
                    if (finalSlug) {
                        handleGoToVitrine(finalSlug);
                        setSearchQuery('');
                        return;
                    }
                }
            }
        }

        // --- RECHERCHE NORMALE ---
        setActiveSearchQuery(query);
        setIsSearchActive(true);
        setActiveCategoryId(null);
        setSelectedCategory(categories[0]?.slug || '');

        // Utiliser les paramètres directement au lieu du state (async)
        await fetchFeed(1, 20, undefined, query);
        await loadVitrines(null, query);

        setPage(1);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [fetchFeed, loadVitrines, categories, handleGoToAnnonceDetail, handleGoToVitrine]);

    const filterByCategory = useCallback(async (categorySlug: string) => {
        setSelectedCategory(categorySlug);
        const isReset = categorySlug === 'all' || categorySlug === categories[0]?.slug;
        const newCategoryId = isReset ? null : categorySlug;

        setActiveCategoryId(newCategoryId);
        setIsSearchActive(false);
        setActiveSearchQuery('');
        setSearchQuery('');

        // Utiliser newCategoryId directement au lieu de activeCategoryId (state async)
        await fetchFeed(1, 20, newCategoryId || undefined, undefined);
        await loadVitrines(newCategoryId, undefined);

        setPage(1);

        // REMONTER EN HAUT AU CLIC SUR UNE CATÉGORIE
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [fetchFeed, loadVitrines, categories]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadFeed(1);
        } finally {
            setRefreshing(false);
        }
    }, [loadFeed]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            loadFeed(page + 1);
        }
    }, [isLoading, hasMore, page, loadFeed]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (!text.trim() && isSearchActive) resetToFullFeed();
    };

    const resetToFullFeed = useCallback(async () => {
        setIsSearchActive(false);
        setActiveSearchQuery('');
        setSearchQuery('');
        setActiveCategoryId(null);
        setSelectedCategory(categories[0]?.slug || '');

        // Charger tout sans filtres
        await fetchFeed(1, 20, undefined, undefined);
        await loadVitrines(null, undefined);

        setPage(1);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [fetchFeed, loadVitrines, categories]);


    // --- CONSTRUCTION DE LA LISTE HYBRIDE ---

    const combinedData = useMemo(() => {
        // CHANGEMENT: On retire SEARCH_BAR de la liste car elle est maintenant au-dessus
        const baseItems = isSearchActive
            ? [{ type: 'SEARCH_BAR' }]
            : [{ type: 'SEARCH_BAR' }, { type: 'BANNER' }, { type: 'CATEGORIES' }];

        const items = [...baseItems];

        // Insérer les annonces et les blocs vitrines
        const itemsToProcess = Array.isArray(annonces) ? annonces : [];
        let vitrineBlockInserted = false;

        if (isLoading && (itemsToProcess.length === 0)) {
            items.push({ type: 'LOADING_STATE' } as any);
        } else if (itemsToProcess.length > 0) {
            itemsToProcess.forEach((annonce: any, index: number) => {
                items.push(annonce);

                // Insérer le bloc vitrine après la 5ème annonce (index 4)
                if (index === 4 && vitrines.length > 0) {
                    items.push({ type: 'VITRINE_BLOCK' });
                    vitrineBlockInserted = true;
                }
                // Puis après chaque 15 annonces (index 19, 34, 49, etc.)
                else if (index > 4 && (index - 4) % 15 === 0 && vitrines.length > 0) {
                    items.push({ type: 'VITRINE_BLOCK' });
                }
            });

            // Si on a moins de 5 annonces, on met le bloc vitrine à la fin
            if (!vitrineBlockInserted && vitrines.length > 0) {
                items.push({ type: 'VITRINE_BLOCK' });
            }
        } else if (!isLoading) {
            // Si pas d'annonces mais des vitrines
            if (vitrines.length > 0) {
                items.push({ type: 'VITRINE_BLOCK' });
                // Optionnel: ajouter un petit message qu'il n'y a pas d'annonces mais voici les vitrines
                items.push({
                    type: 'EMPTY_STATE',
                    message: "Aucune annonce dans cette catégorie, mais voici les vitrines correspondantes."
                } as any);
            } else {
                // Rien du tout
                items.push({
                    type: 'EMPTY_STATE',
                    error: error,
                    message: error ? error : "Aucune annonce ni vitrine ne correspond à votre recherche ou catégorie."
                } as any);
            }
        }

        return items;
    }, [annonces, isSearchActive, vitrines, isLoading, error]);

    // STICKY HEADER INDICES
    // isSearchActive: SEARCH_BAR=0, CATEGORIES=1 (if no banner). 
    // Actually, when isSearchActive, we probably still want categories? 
    // In current implementation, isSearchActive removes BANNER and CATEGORIES from combinedData baseItems.
    // Wait, let's look at line 256. If isSearchActive, baseItems = [].
    // I should change that to include SEARCH_BAR at least.
    const stickyIndices = useMemo(() => {
        if (isSearchActive) return [0]; // Search bar sticks if searching? Or maybe not.
        return [2]; // SEARCH_BAR=0, BANNER=1, CATEGORIES=2
    }, [isSearchActive]);


    // COMPOSANT RENDER DES CATÉGORIES (Réutilisé)
    const renderCategories = () => (
        <View style={[styles.categoriesSection, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map((category) => (
                    <View key={category.slug} style={styles.compactPillWrapper}>
                        <CategoryPill
                            name={category.name}
                            slug={category.slug}
                            imageUri={category.imageUri}
                            isSelected={selectedCategory === category.slug}
                            onPress={filterByCategory}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        switch (item.type) {
            case 'SEARCH_BAR':
                return (
                    <View style={[styles.headerSection, { backgroundColor: theme.colors.background }]}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            placeholder="Rechercher..."
                            containerStyle={styles.compactSearchBar}
                            onSearch={filterBySearch}
                        />

                        {isSearchActive && (
                            <TouchableOpacity
                                onPress={resetToFullFeed}
                                style={styles.backButtonContainer}
                                accessibilityLabel="Retour à l'accueil"
                            >
                                <View style={styles.backButtonContent}>
                                    <Ionicons
                                        name="arrow-back-outline"
                                        size={16}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                                        Retour
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                );

            case 'BANNER':
                return (
                    <View
                        style={styles.bannerSection}
                    >
                        <ImageCarousel />
                    </View>
                );

            case 'CATEGORIES':
                return renderCategories();

            case 'VITRINE_BLOCK':
                return (
                    <VitrineScrollBlock
                        vitrines={vitrines}
                        onVitrinePress={handleGoToVitrine}
                        onSeeMorePress={handleGoToVitrineList}
                        isLoading={isLoadingVitrines}
                    />
                );

            case 'LOADING_STATE':
                return (
                    <View style={{ height: 300, justifyContent: 'center' }}>
                        <LoadingComponent />
                    </View>
                );

            case 'EMPTY_STATE':
                return (
                    <StateMessage
                        type={item.error ? "error" : "empty"}
                        message={item.message}
                        onRetry={onRefresh}
                    />
                );

            default:
                return (
                    <View style={styles.feedCardContainer}>
                        <ProductFeedCard
                            annonce={item}
                            onCardPress={() => handleGoToAnnonceDetail(item.slug)}
                            onVitrinePress={handleGoToVitrine}
                        />
                    </View>
                );
        }
    };


    return (
        <ScreenWrapper>
            <View style={{ flex: 1, position: 'relative' }}>
                <FlatList
                    ref={flatListRef}
                    data={combinedData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => {
                        if (item.type === 'VITRINE_BLOCK') return `vitrine-block-${index}`;
                        return item.slug || item.type || `index-${index}`;
                    }}

                    stickyHeaderIndices={stickyIndices}

                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}

                    ListEmptyComponent={null}
                    ListFooterComponent={
                        isLoading && annonces?.length > 0 ? (
                            <View style={styles.footer}><ActivityIndicator size="small" color={theme.colors.primary} /></View>
                        ) : null
                    }

                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}

                    refreshControl={
                        < RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                    }

                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            </View>

            {showScrollTopButton && (
                <TouchableOpacity
                    style={[styles.scrollTopButton, { backgroundColor: theme.colors.primary }]}
                    onPress={scrollToTop}
                    accessibilityLabel="Retour en haut"
                >
                    <Ionicons name="arrow-up" size={20} color={theme.colors.white} />
                </TouchableOpacity>
            )}
        </ScreenWrapper >
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    content: {
        paddingBottom: theme.spacing.l,
        backgroundColor: theme.colors.background,
    },
    // SearchBar
    headerSection: {
        paddingHorizontal: theme.spacing.s,
        paddingTop: theme.spacing.s,
        paddingBottom: theme.spacing.m,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        // Removed elevation/shadows for minimalist check or kept subtle if needed? 
        // Instructions say "Design minimaliste". Flat is better.
        backgroundColor: theme.colors.background,
    },
    compactSearchBar: {
        marginBottom: 0,
        height: 40,
        // SearchBar component itself needs to be checked if it uses theme.colors.surfaceLight, assuming it does or will receive style.
    },
    // Styles pour le bouton de retour sous la barre de recherche
    backButtonContainer: {
        // Aligné à gauche, prend toute la largeur pour le TouchableOpacity
        alignSelf: 'flex-start',
        marginTop: theme.spacing.s,
        paddingHorizontal: theme.spacing.s, // Laisse un petit espace
        paddingVertical: 3,
    },
    backButtonContent: {
        flexDirection: 'row', // Pour aligner l'icône et le texte
        alignItems: 'center',
        // Petit effet visuel pour distinguer l'action
        borderRadius: theme.borderRadius.s,
    },
    backButtonText: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
        marginLeft: theme.spacing.s, // Espace entre l'icône et le texte
    },
    // --- Styles existants (inchangés) ---
    resetButton: {
        alignItems: 'center',
        paddingVertical: 2,
    },
    bannerSection: {
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.xs, // Reduced from .m to .xs for tighter spacing
        // Carousel Padding logic was managed by constant CAROUSEL_PADDING_HORIZONTAL = 0
    },
    categoriesSection: {
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        zIndex: 20, // Assure que les catégories restent au-dessus
        elevation: 4, // Pour Android
    },
    categoriesContent: {
        paddingHorizontal: theme.spacing.s,
        alignItems: 'center',
    },
    compactPillWrapper: {
        transform: [{ scale: 0.85 }],
        marginRight: -8,
        marginHorizontal: 1,
    },
    center: {
        padding: theme.spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingVertical: theme.spacing.m,
        alignItems: 'center',
    },
    feedCardContainer: {
        width: SCREEN_WIDTH,
        // alignItems: 'flex-start', // REMOVED to allow stretch
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.small,
        zIndex: 1000,
    }
});

export default HomeScreen;