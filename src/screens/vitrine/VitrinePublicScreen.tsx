import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines } from '../../hooks/useVitrines';
import { ShareButton } from '../../components/ShareButton';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAnnonces } from '../../hooks/useAnnonces';
import { AnnonceCard } from '../../components/AnnonceCard';
import { ENV } from '../../config/env';
import { DEFAULT_IMAGES } from '../../constants/images';

// Helper pour sécuriser les sources d'images
const getSafeUri = (source: any): string | undefined => {
    if (!source) return undefined;
    if (typeof source === 'string') return source;
    if (source.uri) return source.uri;
    if (source.url) return source.url;
    if (Array.isArray(source) && source.length > 0) return getSafeUri(source[0]);
    return undefined;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const VitrinePublicScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { slug } = route.params || {}; // Slug is MANDATORY for public view
    const { theme } = useTheme();
    const {
        fetchVitrineBySlug,
        isLoading: isVitrinesLoading,
    } = useVitrines();

    const { isGuest } = useAuth();
    const { annonces, fetchAnnoncesByVitrine, isLoading: annoncesLoading, hasMore } = useAnnonces();
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [displayedVitrine, setDisplayedVitrine] = useState<any>(null);

    // --- LOGIQUE REFRESH ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const vitrineSlug = slug || displayedVitrine?.slug;
            if (vitrineSlug) {
                await fetchVitrineBySlug(vitrineSlug);
                setPage(1);
                await fetchAnnoncesByVitrine(vitrineSlug, 1, 10);
            }
        } catch (error) {
            console.error("Erreur refresh vitrine:", error);
            setError("Erreur lors du rafraîchissement.");
        } finally {
            setRefreshing(false);
        }
    }, [slug, displayedVitrine?.slug, fetchVitrineBySlug, fetchAnnoncesByVitrine]);

    // Chargement de la vitrine affichée based on SLUG
    useEffect(() => {
        const loadVitrine = async () => {
            if (slug) {
                const vitrine = await fetchVitrineBySlug(slug);
                if (vitrine) {
                    setDisplayedVitrine(vitrine);
                    setPage(1);
                    fetchAnnoncesByVitrine(vitrine.slug, 1, 10);
                }
            }
        };
        loadVitrine();
    }, [slug, fetchVitrineBySlug, fetchAnnoncesByVitrine]);

    const loadMoreAnnonces = () => {
        if (!annoncesLoading && hasMore && displayedVitrine?.slug) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAnnoncesByVitrine(displayedVitrine.slug, nextPage, 10);
        }
    };

    if (isVitrinesLoading && !displayedVitrine) {
        return (
            <ScreenWrapper style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </ScreenWrapper>
        );
    }

    if (!displayedVitrine) {
        return (
            <ScreenWrapper style={styles.loadingContainer}>
                <Text style={{ color: theme.colors.text }}>Aucune vitrine trouvée.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.colors.primary }}>Retour</Text>
                </TouchableOpacity>
            </ScreenWrapper>
        );
    }

    const currentVitrine = displayedVitrine;
    const pagePath = `v/${currentVitrine.slug}`;
    const fullUrl = `${ENV.SHARE_BASE_URL}/${pagePath}`;

    const shareData = {
        title: `Vitrine de ${currentVitrine.name}`,
        vitrineName: currentVitrine.name,
    };

    const whatsappMessage =
        `Bonjour ${currentVitrine.name || ''}, je visite votre vitrine sur l'application.\n` +
        `J'aimerais avoir plus d'informations.\n\n` +
        `Lien de la vitrine : ${fullUrl}`;

    // Header Content Component (Visitor Only)
    const ListHeader = () => (
        <>
            {/* 1. Cover & Avatar */}
            <View style={styles.coverSection}>
                {/* 1.1. Cover Image (Read Only) */}
                <Image
                    source={getSafeUri(currentVitrine.coverImage || currentVitrine.banner)
                        ? { uri: getSafeUri(currentVitrine.coverImage || currentVitrine.banner) }
                        : DEFAULT_IMAGES.cover
                    }
                    style={styles.coverImage}
                    resizeMode="cover"
                />

                {/* 1.2. Avatar (Read Only) */}
                <View style={[styles.avatarSection, { borderColor: theme.colors.surface }]}>
                    <Image
                        source={getSafeUri(currentVitrine.logo || currentVitrine.avatar)
                            ? { uri: getSafeUri(currentVitrine.logo || currentVitrine.avatar) }
                            : DEFAULT_IMAGES.avatar
                        }
                        style={[styles.avatar, { borderColor: theme.colors.surface }]}
                    />
                </View>

                {/* 1.3. Header Actions */}
                <View style={styles.floatingHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.actionButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.surface} />
                    </TouchableOpacity>
                    {/* NO Settings Button for Visitors */}
                </View>
            </View>

            {/* 2. Bloc Info */}
            <View style={styles.infoBlock}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{currentVitrine.name}</Text>
                <Text style={[styles.category, { color: theme.colors.primary, marginBottom: 8 }]}>{currentVitrine.category || currentVitrine.type}</Text>

                <Text style={[styles.slug, { color: theme.colors.textTertiary, marginBottom: currentVitrine.description ? 16 : 24 }]}>
                    @{currentVitrine.slug}
                </Text>

                {currentVitrine.description && (
                    <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{currentVitrine.description}</Text>
                )}

                <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

                {/* Contact Info */}
                {(currentVitrine.address || currentVitrine.contact?.email || currentVitrine.contact?.phone) && (
                    <View style={styles.contactDetailsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Infos & Bio</Text>

                        {currentVitrine.address && (
                            <View style={styles.infoItem}>
                                <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Adresse</Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>{currentVitrine.address}</Text>
                                </View>
                            </View>
                        )}
                        {currentVitrine.contact?.email && (
                            <View style={styles.infoItem}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Email</Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>{currentVitrine.contact.email}</Text>
                                </View>
                            </View>
                        )}
                        {currentVitrine.contact?.phone && (
                            <View style={styles.infoItem}>
                                <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Téléphone</Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>{currentVitrine.contact.phone}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Actions Principales (VISITOR ACTIONS ONLY) */}
                <View style={[styles.mainActionsContainer]}>
                    {currentVitrine.contact?.phone ? (
                        <WhatsAppButton
                            phoneNumber={currentVitrine.contact.phone}
                            message={whatsappMessage}
                            style={styles.visitorActionButton}
                        />
                    ) : (
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <Text style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>Aucun contact WhatsApp</Text>
                        </View>
                    )}

                    <ShareButton
                        pagePath={pagePath}
                        shareData={shareData}
                        size={20}
                        color={theme.colors.primary}
                        style={styles.shareRectButton}
                    >
                        <Text style={[styles.shareBtnText, { color: theme.colors.primary }]}>Partager</Text>
                    </ShareButton>
                </View>
            </View>

            {/* 3. Produits Header */}
            <View style={[styles.productsHeader, { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}>
                <Text style={[styles.productsTitle, { color: theme.colors.text }]}>Produits ({annonces.length})</Text>
            </View>
        </>
    );

    return (
        <ScreenWrapper>
            <FlatList
                data={annonces}
                renderItem={({ item }) => (
                    <View style={{ width: (SCREEN_WIDTH / 2) - 24, marginBottom: 16 }}>
                        <AnnonceCard
                            annonce={item}
                            onPress={() => navigation.push('AnnonceDetail', { slug: item.slug })}
                        />
                    </View>
                )}
                keyExtractor={(item) => item.slug}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.content}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    annoncesLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 24 }} />
                    ) : (
                        <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                            Aucun produit pour le moment.
                        </Text>
                    )
                }
                ListFooterComponent={
                    annoncesLoading && annonces.length > 0 ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 16 }} />
                    ) : null
                }
                onEndReached={loadMoreAnnonces}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            />
            {isGuest && (
                <View style={styles.guestPromptContainer}>
                    <GuestPrompt message="Connectez-vous pour ajouter vos propres produits" variant="inline" />
                </View>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 40 },
    coverSection: {
        marginBottom: 80,
        width: '100%',
    },
    coverImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#EFEFEF',
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        zIndex: 20,
    },
    actionButton: {
        padding: 8,
        borderRadius: 20,
    },
    avatarSection: {
        position: "absolute",
        bottom: -50,
        left: 20,
        zIndex: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    infoBlock: {
        paddingHorizontal: 16,
        marginTop: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 4,
        marginBottom: 4
    },
    slug: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    category: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 24,
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 24,
    },
    contactDetailsSection: {
        marginBottom: 32
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 16,
    },
    infoContent: {
        flex: 1
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    infoValue: {
        fontSize: 16,
        lineHeight: 22
    },
    mainActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 32,
    },
    visitorActionButton: {
        flex: 1,
        marginRight: 16,
    },
    actionButtonCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareRectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    shareBtnText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    productsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    productsTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        width: '100%'
    },
    guestPromptContainer: {
        padding: 16
    }
});
