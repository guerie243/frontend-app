import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
    FlatList,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines } from '../../hooks/useVitrines';
import { ShareButton } from '../../components/ShareButton';
import ImageUploadCover from "../../components/ImageUploadCover";
import ImageUploadAvatar from "../../components/ImageUploadAvatar";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAnnonces } from '../../hooks/useAnnonces';
import { AnnonceCard } from '../../components/AnnonceCard';
import { ENV } from '../../config/env';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';

// Helper pour sécuriser les sources d'images (évite le crash ReadableNativeArray)
const getSafeUri = (source: any): string | undefined => {
    if (!source) return undefined;
    if (typeof source === 'string') return source;
    if (source.uri) return source.uri;
    if (source.url) return source.url;
    // Si c'est un tableau, prendre le premier élément
    if (Array.isArray(source) && source.length > 0) return getSafeUri(source[0]);
    return undefined;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const VitrineManagementScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const {
        vitrines,
        fetchMyVitrines,
        isLoading: isVitrinesLoading,
        updateVitrine
    } = useVitrines();
    const { user, isAuthenticated, isGuest } = useAuth();
    const { annonces, fetchAnnoncesByVitrine, isLoading: annoncesLoading, hasMore } = useAnnonces();
    const isFocused = useIsFocused();
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [displayedVitrine, setDisplayedVitrine] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<{ visible: boolean; url?: string }>({
        visible: false,
        url: undefined
    });

    // --- LOGIQUE (Gestion de l'état, du rafraîchissement, du chargement) ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchMyVitrines();
            // Le useEffect mettra à jour displayedVitrine
            if (displayedVitrine?.slug) {
                setPage(1);
                await fetchAnnoncesByVitrine(displayedVitrine.slug, 1, 10);
            }
        } catch (error) {
            console.error("Erreur refresh vitrine:", error);
            setError("Erreur lors du rafraîchissement.");
        } finally {
            setRefreshing(false);
        }
    }, [fetchMyVitrines, displayedVitrine?.slug, fetchAnnoncesByVitrine]);

    useEffect(() => {
        if (isFocused && isAuthenticated) {
            fetchMyVitrines();
        }
    }, [isFocused, isAuthenticated, fetchMyVitrines]);

    useEffect(() => {
        if (vitrines && vitrines.length > 0) {
            const vitrine = vitrines[0];
            setDisplayedVitrine(vitrine);
        }
    }, [vitrines]);

    useEffect(() => {
        if (displayedVitrine?.slug) {
            setPage(1);
            fetchAnnoncesByVitrine(displayedVitrine.slug, 1, 10);
        }
    }, [displayedVitrine, fetchAnnoncesByVitrine]);


    const loadMoreAnnonces = () => {
        if (!annoncesLoading && hasMore && displayedVitrine?.slug) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAnnoncesByVitrine(displayedVitrine.slug, nextPage, 10);
        }
    };

    // --- GUEST ---
    if (isGuest) {
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
                        onPress={() => navigation.navigate('Settings')}
                        style={{
                            padding: 8,
                            borderRadius: 20,
                            backgroundColor: theme.colors.border + '40'
                        }}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, marginTop: -120 }}>
                    <GuestPrompt message="Connectez-vous pour gérer votre vitrine" variant="card" />
                </View>
            </ScreenWrapper>
        );
    }

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
                <Text style={{ color: theme.colors.text }}>Vous n'avez pas encore de vitrine.</Text>
                <CustomButton
                    title="Créer ma vitrine"
                    onPress={() => navigation.navigate('CreateEditVitrine')}
                    style={{ marginTop: 20 }}
                />
            </ScreenWrapper>
        );
    }

    const currentVitrine = displayedVitrine;

    // ✅ Création des données structurées pour le ShareButton
    const pagePath = `v/${currentVitrine.slug}`; // La partie après l'URL de base
    const shareData = {
        title: `Vitrine de ${currentVitrine.name}`,
        vitrineName: currentVitrine.name,
    };

    // --- Fonctions de gestion des uploads (inchangées) ---
    const handleAvatarUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(currentVitrine.slug, { logo: newImageUrl });
            setDisplayedVitrine((prev: any) => ({ ...prev, logo: newImageUrl }));
            Alert.alert("Succès", "Le logo a été mis à jour !");
        } catch (error) {
            console.error("Erreur mise à jour logo backend:", error);
            Alert.alert("Erreur", "Échec de la sauvegarde du logo.");
        }
    };

    const handleCoverUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(currentVitrine.slug, { coverImage: newImageUrl });
            setDisplayedVitrine((prev: any) => ({ ...prev, coverImage: newImageUrl }));
            Alert.alert("Succès", "La bannière a été mise à jour !");
        } catch (error) {
            console.error("Erreur mise à jour bannière backend:", error);
            Alert.alert("Erreur", "Échec de la sauvegarde de la bannière.");
        }
    };
    // --------------------------------------------------

    // Header Content Component
    const ListHeader = () => (
        <>
            {/* 1. Cover & Avatar */}
            <View style={styles.coverSection}>

                {/* 1.1. Cover Image / Uploader (OWNER ONLY) */}
                <ImageUploadCover
                    initialImage={currentVitrine.banner || currentVitrine.coverImage}
                    height={200}
                    uploadFolderPath="vitrine_covers/"
                    onUploadSuccess={handleCoverUploadSuccess}
                    onImagePress={(url) => setPreviewImage({ visible: true, url })}
                />

                {/* 1.2. Avatar / Uploader (OWNER ONLY) */}
                <View style={[styles.avatarSection, { borderColor: theme.colors.surface }]}>
                    <ImageUploadAvatar
                        initialImage={currentVitrine.logo || currentVitrine.avatar}
                        size={140}
                        uploadFolderPath="vitrine_logos/"
                        onUploadSuccess={handleAvatarUploadSuccess}
                        onImagePress={(url) => setPreviewImage({ visible: true, url })}
                    />
                </View>

                {/* 1.3. Header Actions (Flottantes au-dessus de la Cover) */}
                <View style={styles.floatingHeader}>
                    {/* Placeholder left */}
                    <View />

                    {/* Actions de droite - VISIBLES UNIQUEMENT POUR LE PROPRIÉTAIRE */}
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.actionButton, styles.settingsButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                            <Ionicons name="settings-outline" size={24} color={theme.colors.surface} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* 2. Bloc Info (Titre, Slog, Description, Contact, Actions) */}
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

                {/* Contact Info (Visible pour tout le monde si disponible, mais l'interaction dépend du rôle) */}
                {(currentVitrine.address || currentVitrine.contact?.email || currentVitrine.contact?.phone) && (
                    <View style={styles.contactDetailsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations de Contact</Text>

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

                {/* Actions Principales (OWNER ONLY) */}
                <View style={[styles.mainActionsContainer]}>
                    <CustomButton
                        title="Gérer ma Vitrine"
                        onPress={() => navigation.navigate('VitrineModificationMain')}
                        style={styles.ownerActionButton}
                    />
                    {/* Bouton Statistiques */}
                    <TouchableOpacity
                        style={[styles.statsButton, { borderColor: theme.colors.border }]}
                        onPress={() => Alert.alert("Statistiques", "Les statistiques de votre vitrine seront bientôt disponibles !")}
                    >
                        <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

                    {/* ShareButton pour le propriétaire */}
                    <ShareButton
                        pagePath={pagePath}
                        shareData={shareData}
                        size={24}
                        color={theme.colors.primary}
                        style={[styles.shareButton, { borderColor: theme.colors.border }]}
                    >
                        <Text style={[styles.shareText, { color: theme.colors.primary }]}>Partager</Text>
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
                            onPress={() => navigation.navigate('AnnonceDetail', { slug: item.slug })}
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
                            Vous n'avez pas encore d'annonces.
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
            <ImagePreviewModal
                visible={previewImage.visible}
                imageUrl={previewImage.url}
                onClose={() => setPreviewImage({ ...previewImage, visible: false })}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 40 },

    // --- STYLES PROFESSIONNELS ---
    coverSection: {
        marginBottom: 80,
        width: '100%',
    },
    coverImage: {
        // Styles handled by component but we can reset borders here if needed
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    settingsButton: {
        marginRight: 16
    },
    avatarSection: {
        position: "absolute",
        bottom: -70,
        left: 10,
        zIndex: 15,
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

    // Nouvelle section d'actions principales (Gérer / WhatsApp)
    mainActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 32,
    },
    ownerActionButton: {
        flex: 1.5,
        marginRight: 12,
    },
    // Style pour le bouton Stats (Owner only)
    statsButton: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    // Le style `shareButton` est maintenant un conteneur pour le ShareButton du propriétaire
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flex: 1, // Ajusté pour s'adapter à côté des autres boutons
    },
    // Nouveau style pour le texte à l'intérieur du ShareButton
    shareText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6, // Marge pour séparer l'icône du texte
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
});

export default VitrineManagementScreen;
