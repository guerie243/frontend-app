import React, { useMemo, useCallback, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines, useVitrineDetail, useMyVitrines } from '../../hooks/useVitrines';
import { ShareButton } from '../../components/ShareButton';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import ImageUploadCover from "../../components/ImageUploadCover";
import ImageUploadAvatar from "../../components/ImageUploadAvatar";
import { Ionicons } from '@expo/vector-icons';
import { LoadingComponent } from '../../components/LoadingComponent';
import { StateMessage } from '../../components/StateMessage';
import { useAuth } from '../../hooks/useAuth';
import { useAnnoncesByVitrine } from '../../hooks/useAnnonces';
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
    const { updateVitrine } = useVitrines();
    const { user, isAuthenticated, isGuest } = useAuth();
    const { showSuccess, showError } = useAlertService();

    // --- QUERIES TANSTACK ---
    const {
        data: detailVitrine,
        isLoading: isDetailLoading,
        refetch: refetchDetail
    } = useVitrineDetail(slug || '');

    const {
        data: myVitrines,
        isLoading: isMyVitrinesLoading,
        refetch: refetchMyVitrines
    } = useMyVitrines();

    const displayedVitrine = slug ? detailVitrine : (myVitrines?.[0] || null);

    // RECUPERATION STRATEGIE : ID vs Slug
    // On privilégie l'ID s'il est disponible (depuis detailVitrine ou myVitrines)
    // Sinon on attend (enabled: !!vitrineId)
    const vitrineId = displayedVitrine?.id || displayedVitrine?._id || displayedVitrine?.vitrineId;

    const {
        data: annoncedata,
        fetchNextPage,
        hasNextPage,
        isLoading: annoncesLoading,
        refetch: refetchAnnonces,
        isRefetching: isRefreshingAnnonces
    } = useAnnoncesByVitrine(vitrineId || '', 10); // On passe l'ID, pas le slug

    const annonces = useMemo(() => {
        return annoncedata?.pages.flat() || [];
    }, [annoncedata]);

    const [previewImage, setPreviewImage] = useState<{ visible: boolean; url?: string }>({
        visible: false,
        url: undefined
    });

    const styles = useMemo(() => createStyles(theme), [theme]);

    const currentUserId = user ? (user.id || user._id || user.userId) : null;
    const isOwner = isAuthenticated && user && displayedVitrine && (currentUserId == displayedVitrine.ownerId || currentUserId == displayedVitrine.owner);

    // --- LOGIQUE REFRESH ---
    const onRefresh = useCallback(async () => {
        await Promise.all([
            slug ? refetchDetail() : refetchMyVitrines(),
            refetchAnnonces()
        ]);
    }, [slug, refetchDetail, refetchMyVitrines, refetchAnnonces]);

    const loadMoreAnnonces = () => {
        if (!annoncesLoading && hasNextPage) {
            fetchNextPage();
        }
    };

    // --- Gestion des Uploads ---
    const handleAvatarUploadSuccess = async (newImageUrl: string) => {
        if (!displayedVitrine) return;
        try {
            await updateVitrine(displayedVitrine.slug, { logo: newImageUrl });
            showSuccess('Le logo a été mis à jour !');
        } catch (error) {
            console.error('Erreur mise à jour logo:', error);
            showError('Échec de la sauvegarde du logo.');
        }
    };

    const handleCoverUploadSuccess = async (newImageUrl: string) => {
        if (!displayedVitrine) return;
        try {
            await updateVitrine(displayedVitrine.slug, { coverImage: newImageUrl });
            showSuccess('La bannière a été mise à jour !');
        } catch (error) {
            console.error('Erreur mise à jour bannière:', error);
            showError('Échec de la sauvegarde de la bannière.');
        }
    };

    // --- Chargement / Erreurs ---
    const isOverallLoading = slug ? isDetailLoading : isMyVitrinesLoading;
    if (isOverallLoading && !displayedVitrine) {
        return <LoadingComponent />;
    }

    if (!displayedVitrine) {
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
                            onPress={() => navigation.navigate('Settings')}
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: theme.colors.border + '40',
                                zIndex: 1000
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
            <View style={styles.coverSection}>
                {isOwner ? (
                    <ImageUploadCover
                        initialImage={displayedVitrine.coverImage}
                        height={200}
                        onUploadSuccess={handleCoverUploadSuccess}
                        onImagePress={(url) => setPreviewImage({ visible: true, url })}
                    />
                ) : (
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
                        <ImageUploadAvatar
                            initialImage={displayedVitrine.logo}
                            size={100}
                            onUploadSuccess={handleAvatarUploadSuccess}
                            onImagePress={(url) => setPreviewImage({ visible: true, url })}
                        />
                    ) : (
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

                <View style={[styles.floatingHeader, { justifyContent: 'flex-end' }]}>
                    {isOwner && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Settings')}
                            style={styles.actionButton}
                        >
                            <Ionicons name="settings-outline" size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

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

                <View style={styles.mainActionsContainer}>
                    {isOwner ? (
                        <>
                            <CustomButton
                                title="Gérer ma Vitrine"
                                onPress={() => navigation.navigate('VitrineModificationMain')}
                                style={styles.ownerActionButton}
                            />
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
                    <RefreshControl refreshing={isRefreshingAnnonces} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            />
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
        marginVertical: 0,
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
});

export default VitrineDetailScreen;

