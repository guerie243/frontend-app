import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductFeedCard } from '../../components/ProductFeedCard';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAnnonceFeed } from '../../hooks/useAnnonces';

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
import { useAllVitrines } from '../../hooks/useVitrines';

// Données
import { CATEGORIES_VITRINE } from '../../Data/vitrinecategorys';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const isFocused = useIsFocused();

    // Recherche et Filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const categories = CATEGORIES_VITRINE;
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.slug || '');

    // QUERIES TANSTACK
    const {
        data: feedData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isFeedLoading,
        isError: isFeedError,
        refetch: refetchFeed,
        isRefetching: isRefreshingFeed
    } = useAnnonceFeed(20, activeCategoryId, activeSearchQuery);

    const annonces = useMemo(() => {
        return feedData?.pages.flatMap(page => page.data || []) || [];
    }, [feedData]);

    const {
        data: vitrinesData,
        isLoading: isLoadingVitrines,
        refetch: refetchVitrines
    } = useAllVitrines(1, 6, activeCategoryId || undefined, activeSearchQuery || undefined);

    const vitrines = vitrinesData?.vitrines || [];

    const [showScrollTopButton, setShowScrollTopButton] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);
    const lastOffsetY = React.useRef(0);

    useEffect(() => {
        const params = route.params as any;
        if (params?.refreshTimestamp) {
            refetchFeed();
            refetchVitrines();
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    }, [route.params, refetchFeed, refetchVitrines]);


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

    useEffect(() => {
        if (isFocused) {
            refetchFeed();
            refetchVitrines();
        }
    }, [isFocused, refetchFeed, refetchVitrines]);

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

        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [handleGoToAnnonceDetail, handleGoToVitrine, categories]);

    const filterByCategory = useCallback((categorySlug: string) => {
        setSelectedCategory(categorySlug);
        const isReset = categorySlug === 'all' || categorySlug === categories[0]?.slug;
        const newCategoryId = isReset ? null : categorySlug;

        setActiveCategoryId(newCategoryId);
        setIsSearchActive(false);
        setActiveSearchQuery('');
        setSearchQuery('');

        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [categories]);

    const onRefresh = useCallback(async () => {
        await Promise.all([refetchFeed(), refetchVitrines()]);
    }, [refetchFeed, refetchVitrines]);

    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (!text.trim() && isSearchActive) resetToFullFeed();
    };

    const resetToFullFeed = useCallback(() => {
        setIsSearchActive(false);
        setActiveSearchQuery('');
        setSearchQuery('');
        setActiveCategoryId(null);
        setSelectedCategory(categories[0]?.slug || '');

        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [categories]);


    // --- CONSTRUCTION DE LA LISTE HYBRIDE ---

    const combinedData = useMemo(() => {
        const baseItems = isSearchActive
            ? [{ type: 'SEARCH_BAR' }]
            : [{ type: 'SEARCH_BAR' }, { type: 'BANNER' }, { type: 'CATEGORIES' }];

        const items = [...baseItems];

        const itemsToProcess = annonces;
        let vitrineBlockInserted = false;

        if (isFeedLoading && itemsToProcess.length === 0) {
            items.push({ type: 'LOADING_STATE' } as any);
        } else if (itemsToProcess.length > 0) {
            itemsToProcess.forEach((annonce: any, index: number) => {
                items.push(annonce);

                if (index === 4 && vitrines.length > 0) {
                    items.push({ type: 'VITRINE_BLOCK' });
                    vitrineBlockInserted = true;
                }
                else if (index > 4 && (index - 4) % 15 === 0 && vitrines.length > 0) {
                    items.push({ type: 'VITRINE_BLOCK' });
                }
            });

            if (!vitrineBlockInserted && vitrines.length > 0) {
                items.push({ type: 'VITRINE_BLOCK' });
            }
        } else if (!isFeedLoading) {
            if (vitrines.length > 0) {
                items.push({ type: 'VITRINE_BLOCK' });
                items.push({
                    type: 'EMPTY_STATE',
                    message: "Aucune annonce dans cette catégorie, mais voici les vitrines correspondantes."
                } as any);
            } else {
                items.push({
                    type: 'EMPTY_STATE',
                    error: isFeedError,
                    message: isFeedError ? "erreur réessayez" : "Aucune annonce ni vitrine ne correspond à votre recherche ou catégorie."
                } as any);
            }
        }

        return items;
    }, [annonces, isSearchActive, vitrines, isFeedLoading, isFeedError]);

    const stickyIndices = useMemo(() => {
        if (isSearchActive) return [0];
        return [2];
    }, [isSearchActive]);


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
                    <View style={styles.bannerSection}>
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
                        isFetchingNextPage ? (
                            <View style={styles.footer}><ActivityIndicator size="small" color={theme.colors.primary} /></View>
                        ) : null
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshingFeed} onRefresh={onRefresh} tintColor={theme.colors.primary} />
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
        </ScreenWrapper>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    content: {
        paddingBottom: theme.spacing.l,
        backgroundColor: theme.colors.background,
    },
    headerSection: {
        paddingHorizontal: theme.spacing.s,
        paddingTop: theme.spacing.s,
        paddingBottom: theme.spacing.m,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    compactSearchBar: {
        marginBottom: 0,
        height: 40,
    },
    backButtonContainer: {
        alignSelf: 'flex-start',
        marginTop: theme.spacing.s,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 3,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.s,
    },
    backButtonText: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
        marginLeft: theme.spacing.s,
    },
    bannerSection: {
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.xs,
    },
    categoriesSection: {
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        zIndex: 20,
        elevation: 4,
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