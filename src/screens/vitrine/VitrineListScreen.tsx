import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { VitrineCard } from '../../components/VitrineCard';
import { vitrineService } from '../../services/vitrineService';
import { LoadingComponent } from '../../components/LoadingComponent';
import { Vitrine } from '../../types';

type VitrineListScreenRouteProp = RouteProp<{
    VitrineList: {
        category?: string;
        search?: string;
    };
}, 'VitrineList'>;

export const VitrineListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<VitrineListScreenRouteProp>();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const { category, search } = route.params || {};

    const [vitrines, setVitrines] = useState<Vitrine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadVitrines = useCallback(async (pageNum: number, isRefresh = false) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const result = await vitrineService.getAllVitrines(pageNum, 20, category, search);

            if (isRefresh) {
                setVitrines(result.vitrines);
            } else {
                setVitrines(prev => [...prev, ...result.vitrines]);
            }

            setHasMore(result.hasMore);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading vitrines:', error);
        } finally {
            setIsLoading(false);
        }
    }, [category, search, isLoading]);

    useEffect(() => {
        loadVitrines(1, true);
    }, [category, search]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadVitrines(1, true);
        setRefreshing(false);
    }, [loadVitrines]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            loadVitrines(page + 1);
        }
    }, [isLoading, hasMore, page, loadVitrines]);

    const handleVitrinePress = (slug: string) => {
        (navigation as any).navigate('VitrineDetail', { slug });
    };

    const renderItem = ({ item }: { item: Vitrine }) => (
        <VitrineCard
            vitrine={item}
            onPress={() => handleVitrinePress(item.slug)}
            variant="list"
        />
    );

    return (
        <ScreenWrapper>
            <FlatList
                data={vitrines}
                renderItem={renderItem}
                keyExtractor={(item) => item.vitrineId}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}

                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                            {search ? `Résultats pour "${search}"` :
                                category && category !== 'all' ? `Vitrines - ${category}` :
                                    'Toutes les vitrines'}
                        </Text>
                    </View>
                }

                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.colors.textSecondary }}>
                                Aucune vitrine trouvée
                            </Text>
                        </View>
                    ) : null
                }

                ListFooterComponent={
                    isLoading && vitrines.length > 0 ? (
                        <View style={styles.footer}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    ) : null
                }

                onEndReached={loadMore}
                onEndReachedThreshold={0.5}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            />

            {isLoading && vitrines.length === 0 && (
                <LoadingComponent />
            )}
        </ScreenWrapper>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    content: {
        paddingBottom: theme.spacing.l,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    headerTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        paddingVertical: theme.spacing.m,
        alignItems: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
});

export default VitrineListScreen;
