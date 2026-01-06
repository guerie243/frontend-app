import React, { useMemo, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines, useMyVitrines } from '../../hooks/useVitrines';
import { ShareButton } from '../../components/ShareButton';
import ImageUploadCover from "../../components/ImageUploadCover";
import ImageUploadAvatar from "../../components/ImageUploadAvatar";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAnnoncesByVitrine } from '../../hooks/useAnnonces';
import { AnnonceCard } from '../../components/AnnonceCard';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';
import { useAlertService } from '../../utils/alertService';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const VitrineManagementScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { updateVitrine } = useVitrines();
    const { isGuest } = useAuth();
    const { showSuccess, showError, showInfo } = useAlertService();

    // --- QUERIES TANSTACK ---
    const {
        data: myVitrines,
        isLoading: isVitrinesLoading,
        refetch: refetchMyVitrines
    } = useMyVitrines();

    const currentVitrine = myVitrines?.[0] || null;

    const {
        data: annoncedata,
        fetchNextPage,
        hasNextPage,
        isLoading: annoncesLoading,
        refetch: refetchAnnonces,
        isRefetching: isRefreshingAnnonces
    } = useAnnoncesByVitrine(currentVitrine?.slug || '', 10);

    const annonces = useMemo(() => {
        return annoncedata?.pages.flat() || [];
    }, [annoncedata]);

    const [previewImage, setPreviewImage] = useState<{ visible: boolean; url?: string }>({
        visible: false,
        url: undefined
    });

    // --- LOGIQUE (Gestion de l'état, du rafraîchissement, du chargement) ---
    const onRefresh = useCallback(async () => {
        await Promise.all([refetchMyVitrines(), refetchAnnonces()]);
    }, [refetchMyVitrines, refetchAnnonces]);

    const loadMoreAnnonces = () => {
        if (!annoncesLoading && hasNextPage) {
            fetchNextPage();
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

    if (isVitrinesLoading && !currentVitrine) {
        return (
            <ScreenWrapper style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </ScreenWrapper>
        );
    }

    if (!currentVitrine) {
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

    // ✅ Création des données structurées pour le ShareButton
    const pagePath = `v/${currentVitrine.slug}`;
    const shareData = {
        title: `Vitrine de ${currentVitrine.name}`,
        vitrineName: currentVitrine.name,
    };

    // --- Fonctions de gestion des uploads ---
    const handleAvatarUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(currentVitrine.slug, { logo: newImageUrl });
            showSuccess('Le logo a été mis à jour !');
        } catch (error) {
            console.error('Erreur mise à jour logo backend:', error);
            showError('Échec de la sauvegarde du logo.');
        }
    };

    const handleCoverUploadSuccess = async (newImageUrl: string) => {
        try {
            await updateVitrine(currentVitrine.slug, { coverImage: newImageUrl });
            showSuccess('La bannière a été mise à jour !');
        } catch (error) {
            console.error('Erreur mise à jour bannière backend:', error);
            showError('Échec de la sauvegarde de la bannière.');
        }
    };

    const ListHeader = () => (
        <>
            <View style={styles.coverSection}>
                <ImageUploadCover
                    initialImage={currentVitrine.banner || currentVitrine.coverImage}
                    height={200}
                    uploadFolderPath="vitrine_covers/"
                    onUploadSuccess={handleCoverUploadSuccess}
                    onImagePress={(url) => setPreviewImage({ visible: true, url })}
                />
                <View style={[styles.avatarSection, { borderColor: theme.colors.surface }]}>
                    <ImageUploadAvatar
                        initialImage={currentVitrine.logo || currentVitrine.avatar}
                        size={140}
                        uploadFolderPath="vitrine_logos/"
                        onUploadSuccess={handleAvatarUploadSuccess}
                        onImagePress={(url) => setPreviewImage({ visible: true, url })}
                    />
                </View>
                <View style={styles.floatingHeader}>
                    <View />
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.actionButton, styles.settingsButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                            <Ionicons name="settings-outline" size={24} color={theme.colors.surface} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

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

                <View style={[styles.mainActionsContainer]}>
                    <CustomButton
                        title="Gérer ma Vitrine"
                        onPress={() => navigation.navigate('VitrineModificationMain')}
                        style={styles.ownerActionButton}
                    />
                    <TouchableOpacity
                        style={[styles.statsButton, { borderColor: theme.colors.border }]}
                        onPress={() => showInfo('Les statistiques de votre vitrine seront bientôt disponibles !', 'Statistiques')}
                    >
                        <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

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

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 40 },
    coverSection: {
        marginBottom: 80,
        width: '100%',
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
    statsButton: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flex: 1,
    },
    shareText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
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

export default VitrineManagementScreen;
