import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines } from '../../hooks/useVitrines';
import { ShareButton } from '../../components/ShareButton';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import ImageUploadCover from "../../components/ImageUploadCover";
import ImageUploadAvatar from "../../components/ImageUploadAvatar";
import { Ionicons } from '@expo/vector-icons';
import { LoadingComponent } from '../../components/LoadingComponent';
import { StateMessage } from '../../components/StateMessage';
import { useAuth } from '../../hooks/useAuth';
import { useAnnonces } from '../../hooks/useAnnonces';
import { AnnonceCard } from '../../components/AnnonceCard';
import { ENV } from '../../config/env';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';
import { DEFAULT_IMAGES } from '../../constants/images';
import { useAlertService } from '../../utils/alertService';

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

export const VitrineDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { slug } = route.params || {};
    const { theme } = useTheme();
    const {
        fetchVitrineBySlug,
        updateVitrine,
        fetchMyVitrines,
        isLoading: isVitrinesLoading,
    } = useVitrines();

    const { user, isAuthenticated, isGuest } = useAuth();
    const { annonces, fetchAnnoncesByVitrine, isLoading: annoncesLoading, hasMore } = useAnnonces();
    const { showSuccess, showError } = useAlertService();
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [displayedVitrine, setDisplayedVitrine] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<{ visible: boolean; url?: string }>({
        visible: false,
        url: undefined
    });

    const styles = React.useMemo(() => createStyles(theme), [theme]);

    // --- Identification du Propriétaire ---
    // On compare l'ID utilisateur (si connecté) avec l'ownerId de la vitrine
    // Le user peut avoir `id`, `_id` ou `userId` selon la source.
    const currentUserId = user ? (user.id || user._id || user.userId) : null;
    // On utilise une comparaison souple (==) pour gérer string vs number
    const isOwner = isAuthenticated && user && displayedVitrine && (currentUserId == displayedVitrine.ownerId || currentUserId == displayedVitrine.owner);

    // --- LOGIQUE REFRESH ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const targetSlug = slug || displayedVitrine?.slug;
            if (targetSlug) {
                const refreshedVitrine = await fetchVitrineBySlug(targetSlug);
                setDisplayedVitrine(refreshedVitrine);
                setPage(1);
                fetchAnnoncesByVitrine(targetSlug, 1, 10);
            } else if (isAuthenticated && !slug) {
                // Refresh sans slug = re-fetch my vitrine
                const myVitrines = await fetchMyVitrines();
                if (myVitrines && myVitrines.length > 0) {
                    setDisplayedVitrine(myVitrines[0]);
                    setPage(1);
                    fetchAnnoncesByVitrine(myVitrines[0].slug, 1, 10);
                }
            }
        } catch (error) {
            console.error("Erreur refresh vitrine:", error);
            setError("Erreur lors du rafraîchissement.");
        } finally {
            setRefreshing(false);
        }
    }, [slug, displayedVitrine?.slug, fetchVitrineBySlug, fetchAnnoncesByVitrine, isAuthenticated, fetchMyVitrines]);

    // Charger les donées
    useEffect(() => {
        const loadVitrine = async () => {
            if (slug) {
                // Mode normal : via navigation avec slug
                const vitrine = await fetchVitrineBySlug(slug);
                setDisplayedVitrine(vitrine);
                if (vitrine) {
                    setPage(1);
                    fetchAnnoncesByVitrine(vitrine.slug, 1, 10);
                }
            } else if (isAuthenticated) {
                // Mode "Tab" : pas de slug, on charge la vitrine de l'utilisateur
                try {
                    const myVitrines = await fetchMyVitrines();
                    if (myVitrines && myVitrines.length > 0) {
                        const myVitrine = myVitrines[0];
                        setDisplayedVitrine(myVitrine);
                        setPage(1);
                        fetchAnnoncesByVitrine(myVitrine.slug, 1, 10);
                    } else {
                        // Pas de vitrine
                        setDisplayedVitrine(null);
                    }
                } catch (e) {
                    console.error("Erreur chargement ma vitrine", e);
                }
            }
        };
        loadVitrine();
    }, [slug, isAuthenticated]); // Ajout dépendance isAuthenticated

    const loadMoreAnnonces = () => {
        if (!annoncesLoading && hasMore && displayedVitrine?.slug) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAnnoncesByVitrine(displayedVitrine.slug, nextPage, 10);
        }
    };

    // --- Gestion des Uploads (Propriétaire uniquement) ---
    const handleAvatarUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(displayedVitrine.slug, { logo: newImageUrl });
            setDisplayedVitrine((prev: any) => ({ ...prev, logo: newImageUrl }));
            showSuccess('Le logo a été mis à jour !');
        } catch (error) {
            console.error('Erreur mise à jour logo:', error);
            showError('Échec de la sauvegarde du logo.');
        }
    };

    const handleCoverUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(displayedVitrine.slug, { coverImage: newImageUrl });
            setDisplayedVitrine((prev: any) => ({ ...prev, coverImage: newImageUrl }));
            showSuccess('La bannière a été mise à jour !');
        } catch (error) {
            console.error('Erreur mise à jour bannière:', error);
            showError('Échec de la sauvegarde de la bannière.');
        }
    };

    // --- Chargement / Erreurs ---
    if (isVitrinesLoading && !displayedVitrine) {
        return <LoadingComponent />;
    }

    if (!displayedVitrine) {
        // Si c'est un guest sur l'onglet "Ma Vitrine" (pas de slug)
        if (isGuest && !slug) {
            return (
                <ScreenWrapper>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        paddingHorizontal: 16,
                        paddingTop: 10,
                        marginBottom: 20
                    }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                console.log('Guest navigating to Settings...');
                                navigation.navigate('Settings');
                            }}
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: theme.colors.border + '40',
                                zIndex: 1000 // Ensure it's on top
                            }}
                        >
                            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
                        <GuestPrompt message="Connectez-vous pour voir votre vitrine" variant="card" />
                    </View>
                </ScreenWrapper>
            );
        }

        return (
            <ScreenWrapper>
                <StateMessage
                    type="no-results"
                    message="Désolé, cette vitrine semble ne pas exister ou a été supprimée."
                    onRetry={() => navigation.goBack()}
                    icon="arrow-back-outline"
                />
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



    const ListHeader = () => (
        <>
            {/* 1. Cover & Avatar */}
            <View style={styles.coverSection}>
                {isOwner ? (
                    // OWNER: Uploaders
                    <ImageUploadCover
                        initialImage={displayedVitrine.coverImage}
                        height={200}
                        onUploadSuccess={handleCoverUploadSuccess}
                        onImagePress={(url) => setPreviewImage({ visible: true, url })}
                    />
                ) : (
                    // VISITOR: Simple Image (Decreased height by 1/4: 200 -> 150)
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            const uri = getSafeUri(currentVitrine.coverImage || currentVitrine.banner);
                            setPreviewImage({
                                visible: true,
                                url: uri || Image.resolveAssetSource(DEFAULT_IMAGES.cover).uri
                            });
                        }}
                    >
                        <Image
                            source={getSafeUri(currentVitrine.coverImage || currentVitrine.banner) ? { uri: getSafeUri(currentVitrine.coverImage || currentVitrine.banner) } : DEFAULT_IMAGES.cover}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                <View style={[
                    styles.avatarSection,
                    !isOwner && { bottom: -60 }
                ]}>
                    {isOwner ? (
                        // OWNER: Avatar Uploader
                        <ImageUploadAvatar
                            initialImage={displayedVitrine.logo}
                            size={100}
                            onUploadSuccess={handleAvatarUploadSuccess}
                            onImagePress={(url) => setPreviewImage({ visible: true, url })}
                        />
                    ) : (
                        // VISITOR: Simple Avatar (Increased size: 80 -> 120)
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                const uri = getSafeUri(currentVitrine.logo || currentVitrine.avatar);
                                setPreviewImage({
                                    visible: true,
                                    url: uri || Image.resolveAssetSource(DEFAULT_IMAGES.avatar).uri
                                });
                            }}
                        >
                            <Image
                                source={getSafeUri(currentVitrine.logo || currentVitrine.avatar) ? { uri: getSafeUri(currentVitrine.logo || currentVitrine.avatar) } : DEFAULT_IMAGES.avatar}
                                style={styles.avatarLarge}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* 1.3. Header Actions */}
                <View style={[styles.floatingHeader, { justifyContent: 'flex-end' }]}>
                    {/* OWNER ONLY: Settings Button */}
                    {isOwner && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                console.log('Navigating to Settings...');
                                navigation.navigate('Settings');
                            }}
                            style={styles.actionButton}
                        >
                            <Ionicons name="settings-outline" size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* 2. Bloc Info */}
            <View style={styles.infoBlock}>
                <Text style={styles.title}>{currentVitrine.name}</Text>
                <Text style={styles.category}>
                    {(() => {
                        const rawType = currentVitrine.type;
                        const rawCategory = currentVitrine.category;
                        if (rawType && rawType.toLowerCase() !== 'general' && rawType.toLowerCase() !== 'général') return rawType;
                        if (rawCategory && rawCategory.toLowerCase() !== 'general' && rawCategory.toLowerCase() !== 'général') return rawCategory;
                        return rawType || rawCategory || 'Général';
                    })()}
                </Text>

                <Text style={[styles.slug, { marginBottom: currentVitrine.description ? 16 : 24 }]}>
                    {currentVitrine.slug}
                </Text>

                {currentVitrine.description && (
                    <Text style={styles.description}>{currentVitrine.description}</Text>
                )}

                <View style={styles.separator} />

                {/* Contact Info */}
                {(currentVitrine.address || currentVitrine.contact?.email || currentVitrine.contact?.phone) && (
                    <View style={styles.contactDetailsSection}>
                        <Text style={styles.sectionTitle}>Infos </Text>

                        {currentVitrine.address && (
                            <View style={styles.infoItem}>
                                <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Adresse</Text>
                                    <Text style={styles.infoValue}>{currentVitrine.address}</Text>
                                </View>
                            </View>
                        )}
                        {currentVitrine.contact?.email && (
                            <View style={styles.infoItem}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{currentVitrine.contact.email}</Text>
                                </View>
                            </View>
                        )}
                        {currentVitrine.contact?.phone && (
                            <View style={styles.infoItem}>
                                <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Téléphone</Text>
                                    <Text style={styles.infoValue}>{currentVitrine.contact.phone}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Actions Principales (Différenciées Owner/Visitor) */}
                <View style={styles.mainActionsContainer}>
                    {isOwner ? (
                        // --- OWNER ACTIONS ---
                        <>
                            <CustomButton
                                title="Gérer ma Vitrine"
                                onPress={() => navigation.navigate('VitrineModificationMain')}
                                style={styles.ownerActionButton}
                            />
                            {/* ShareButton Owner */}
                            <View style={styles.shareRectButton}>
                                <ShareButton
                                    pagePath={pagePath}
                                    shareData={shareData}
                                    size={20}
                                    color={theme.colors.primary}
                                >
                                    <Text style={styles.shareBtnText}>Partager</Text>
                                </ShareButton>
                            </View>
                        </>
                    ) : (
                        // --- VISITOR ACTIONS ---
                        <>
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

                            <View style={[styles.shareRectButton, { borderColor: theme.colors.primary }]}>
                                <ShareButton
                                    pagePath={pagePath}
                                    shareData={shareData}
                                    size={20}
                                    color={theme.colors.primary}
                                >
                                    <Text style={styles.shareBtnText}>Partager</Text>
                                </ShareButton>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* 3. Produits Header */}
            <View style={styles.productsHeader}>
                <Text style={styles.productsTitle}>Annonces ({annonces.length})</Text>
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
                            // Important : on passe le slug de l'annonce pour la navigation
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
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={{ marginTop: 16, color: theme.colors.textSecondary, fontSize: 14 }}>
                                Chargement des annonces...
                            </Text>
                        </View>
                    ) : (
                        <StateMessage
                            type="empty"
                            message={isOwner
                                ? "Vous n'avez pas encore d'annonces. Donnez vie à votre vitrine en publiant votre premier article !"
                                : "Cette vitrine n'a pas encore d'annonces disponibles."}
                        />
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
            {/* Prompt pour Guests si ce n'est pas le proprio et qu'ils sont invités */}
            {isGuest && (
                <View style={styles.guestPromptContainer}>
                    {/* Message enlevé selon demande utilisateur */}
                </View>
            )}

            <ImagePreviewModal
                visible={previewImage.visible}
                imageUrl={previewImage.url}
                onClose={() => setPreviewImage({ ...previewImage, visible: false })}
            />
        </ScreenWrapper>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 40, backgroundColor: theme.colors.background },
    coverSection: {
        marginBottom: 60,
        width: '100%',
    },
    coverImage: {
        width: '100%',
        height: 200,
        backgroundColor: theme.colors.surfaceLight,
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
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    avatarSection: {
        position: "absolute",
        bottom: -70,
        left: 10,
        zIndex: 15,
        borderColor: theme.colors.surface,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: theme.colors.surface,
    },
    avatarLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: theme.colors.surface,
    },
    infoBlock: {
        paddingHorizontal: 16,
        marginTop: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 2,
        marginBottom: 2,
        color: theme.colors.text,
    },
    slug: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textTertiary,
    },
    category: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: theme.colors.primary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 16,
        backgroundColor: theme.colors.border,
    },
    contactDetailsSection: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: theme.colors.text,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 12,
    },
    infoContent: {
        flex: 1
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 1,
        textTransform: 'uppercase',
        color: theme.colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        lineHeight: 18,
        color: theme.colors.text,
    },
    mainActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 24,
    },
    ownerActionButton: {
        flex: 1.5,
        marginRight: 12,
        marginVertical: 0, // Override CustomButton default
    },
    visitorActionButton: {
        flex: 1,
        marginRight: 16,
    },
    shareRectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: theme.borderRadius.s,
        height: 50,
        paddingHorizontal: 16,
        borderColor: theme.colors.border,
    },
    shareBtnText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: theme.colors.primary,
    },
    productsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    productsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        width: '100%',
        color: theme.colors.textSecondary,
    },
    guestPromptContainer: {
        padding: 16
    }
});

