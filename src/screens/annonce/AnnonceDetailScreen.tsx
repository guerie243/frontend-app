import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Animated,
    PanResponder,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAnnonces } from '../../hooks/useAnnonces';
import { ShareButton } from '../../components/ShareButton';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useVitrines } from '../../hooks/useVitrines';
import { ProductCarousel } from '../../components/ProductCarousel';
import Avatar from '../../components/Avatar';
import { getRelativeTime } from '../../utils/dateUtils';
import { LoadingComponent } from '../../components/LoadingComponent';
import { StateMessage } from '../../components/StateMessage';
import { ENV } from '../../config/env';
import { DEFAULT_IMAGES } from '../../constants/images';

// Constantes pour l'animation du Bottom Sheet
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_INFO_HEIGHT = SCREEN_HEIGHT * 0.45; // Prend 45% de l'écran minimum
const MAX_INFO_HEIGHT = SCREEN_HEIGHT * 0.85; // Peut monter jusqu'à 85%

export const AnnonceDetailScreen = () => {
    // --- Hooks ---
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { slug } = route.params as { slug: string };
    const { theme } = useTheme();
    const { currentAnnonce, fetchAnnonceBySlug, isLoading, deleteAnnonce } = useAnnonces();
    const { fetchVitrineBySlug } = useVitrines();
    const { user, isAuthenticated } = useAuth();

    // --- États ---
    const [vitrineInfo, setVitrineInfo] = useState<any>(null);
    const [currentInfoHeight, setCurrentInfoHeight] = useState(MIN_INFO_HEIGHT);

    // --- Animation ---
    const infoHeight = useRef(new Animated.Value(MIN_INFO_HEIGHT)).current;

    // Interpolation pour réduire le carousel quand on monte le panneau
    const carouselOpacity = infoHeight.interpolate({
        inputRange: [MIN_INFO_HEIGHT, MAX_INFO_HEIGHT],
        outputRange: [1, 0.3],
        extrapolate: 'clamp',
    });

    // PanResponder pour le glissement vertical
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => Platform.OS !== 'web',
            onMoveShouldSetPanResponder: () => Platform.OS !== 'web',
            onPanResponderMove: (_, gestureState) => {
                if (Platform.OS === 'web') return;
                let newHeight = MIN_INFO_HEIGHT - gestureState.dy;
                // Ajouter une résistance si on dépasse les bornes
                if (newHeight > MAX_INFO_HEIGHT) newHeight = MAX_INFO_HEIGHT + (newHeight - MAX_INFO_HEIGHT) / 5;
                if (newHeight < MIN_INFO_HEIGHT) newHeight = MIN_INFO_HEIGHT + (newHeight - MIN_INFO_HEIGHT) / 5;
                infoHeight.setValue(newHeight);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (Platform.OS === 'web') return;
                // Si on tire fort vers le haut ou si on dépasse la moitié
                const shouldOpen = gestureState.dy < -50 || (currentInfoHeight > (MAX_INFO_HEIGHT + MIN_INFO_HEIGHT) / 2);
                const targetHeight = shouldOpen ? MAX_INFO_HEIGHT : MIN_INFO_HEIGHT;

                Animated.spring(infoHeight, {
                    toValue: targetHeight,
                    useNativeDriver: false,
                    bounciness: 4,
                }).start();
                setCurrentInfoHeight(targetHeight);
            },
        })
    ).current;

    // --- Chargement des données ---
    useEffect(() => {
        if (slug) {
            fetchAnnonceBySlug(slug);
        }
    }, [slug]);

    useEffect(() => {
        const loadVitrineData = async () => {
            if (currentAnnonce?.vitrineSlug) {
                try {
                    const data = await fetchVitrineBySlug(currentAnnonce.vitrineSlug);
                    setVitrineInfo(data);
                } catch (e) {
                    console.error("Erreur chargement vitrine", e);
                }
            }
        };
        if (currentAnnonce) loadVitrineData();
    }, [currentAnnonce]);

    // --- Handlers ---
    const handleEdit = () => {
        if (!currentAnnonce) return;
        navigation.navigate('AnnonceModificationMain', {
            annonceSlug: currentAnnonce.slug,
            vitrineSlug: currentAnnonce.vitrineSlug,
        });
    };

    const handleDelete = async () => {
        if (!currentAnnonce) return;

        if (Platform.OS === 'web') {
            if (window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) {
                try {
                    await deleteAnnonce(currentAnnonce.slug);
                    navigation.goBack();
                } catch (e) {
                    console.error(e);
                    window.alert("Erreur lors de la suppression");
                }
            }
        } else {
            Alert.alert(
                'Suppression',
                'Voulez-vous vraiment supprimer cette annonce ?',
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: async () => {
                            if (currentAnnonce) {
                                await deleteAnnonce(currentAnnonce.slug);
                                navigation.goBack();
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleGoToVitrine = () => {
        if (currentAnnonce?.vitrineSlug) {
            navigation.navigate('VitrineDetail', { slug: currentAnnonce.vitrineSlug });
        }
    };

    // --- Rendu Loading / Vide ---
    if (isLoading && !currentAnnonce) {
        return <LoadingComponent />;
    }

    if (!currentAnnonce) {
        return (
            <ScreenWrapper>
                <StateMessage
                    type="no-results"
                    message="Désolé, cette annonce semble ne plus être disponible."
                    onRetry={() => navigation.goBack()}
                    icon="arrow-back-outline"
                />
            </ScreenWrapper>
        );
    }

    // ✅ Logique isOwner Robuste
    console.log('[AnnonceDetail] Debug Ownership FULL:', {
        isAuthenticated,
        userKeys: user ? Object.keys(user) : 'null',
        userObject: user,
        annonceOwnerId: currentAnnonce?.ownerId,
    });
    // Tentative de fallback sur d'autres champs ID possibles
    const currentUserId = user?.userId || user?.id || user?._id || user?.user_id;
    const isOwner = isAuthenticated && user && currentAnnonce && String(currentUserId) === String(currentAnnonce.ownerId);

    const lastModified = currentAnnonce.updatedAt || currentAnnonce.createdAt;

    // ✅ Création des données structurées pour le ShareButton
    const pagePath = `a/${currentAnnonce.slug}`;
    const fullUrl = `${ENV.SHARE_BASE_URL}/${pagePath}`;

    const shareData = {
        title: currentAnnonce.title,
        price: currentAnnonce.price,
        currency: currentAnnonce.currency || 'USD',
        vitrineName: vitrineInfo?.name,
    };

    // ✅ CONSTRUCTION DU MESSAGE WHATSAPP EXPLICITE
    const price = `${currentAnnonce.price} ${currentAnnonce.currency || 'USD'}`;
    const priceText = currentAnnonce.price ? ` pour ${price}` : '';

    const whatsappMessage =
        `Bonjour, j'ai vu sur Andy votre annonce: "${currentAnnonce.title}"${priceText}.\n` +
        `Je suis intéressé. Pourriez-vous me donner plus de détails ?\n\n` +
        `Lien de l'annonce : ${fullUrl}`;


    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>

            {/* 1. Zone Image Arrière Plan (Carousel) */}
            <Animated.View style={[styles.carouselContainer, { opacity: carouselOpacity }]}>
                {/* On donne une hauteur fixe un peu plus grande pour l'effet visuel */}
                <ProductCarousel height={SCREEN_HEIGHT * 0.6} images={currentAnnonce.images} />

                {/* Bouton retour flottant */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>

            {/* 2. Panneau d'information (Bottom Sheet) */}
            <Animated.View
                style={[
                    styles.infoSheet,
                    {
                        height: infoHeight,
                        backgroundColor: theme.colors.surface
                    }
                ]}
            >
                {/* Zone de Grip (PanResponder) */}
                <View {...panResponder.panHandlers} style={styles.gripContainer}>
                    <View style={[styles.gripHandle, { backgroundColor: theme.colors.border }]} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* A. En-tête : Titre & Prix */}
                    <View style={styles.headerSection}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                {currentAnnonce.title}
                            </Text>
                            {/* Badge de date relative */}
                            <View style={[styles.dateBadge, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                                <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                                    {getRelativeTime(lastModified)}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.price, { color: theme.colors.primary }]}>
                            {price}
                        </Text>

                        {((Array.isArray(currentAnnonce.locations) && currentAnnonce.locations.length > 0) || (typeof currentAnnonce.locations === 'string' && currentAnnonce.locations.trim() !== '')) && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-sharp" size={16} color={theme.colors.textSecondary} />
                                <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                                    {Array.isArray(currentAnnonce.locations)
                                        ? currentAnnonce.locations.join(', ')
                                        : typeof currentAnnonce.locations === 'string'
                                            ? currentAnnonce.locations
                                            : ''
                                    }
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

                    {/* B. Identité Vendeur (Seulement pour VISITEUR) */}
                    {vitrineInfo && (
                        <TouchableOpacity
                            style={[styles.sellerCard, { backgroundColor: theme.colors.background }]}
                            onPress={handleGoToVitrine}
                        >
                            <Avatar
                                size={50}
                                source={vitrineInfo.logo || vitrineInfo.avatar
                                    ? { uri: vitrineInfo.logo || vitrineInfo.avatar }
                                    : DEFAULT_IMAGES.avatar
                                }
                            />
                            <View style={styles.sellerInfo}>
                                <Text style={[styles.sellerLabel, { color: theme.colors.textSecondary }]}>par</Text>
                                <Text style={[styles.sellerName, { color: theme.colors.text }]}>{vitrineInfo.name}</Text>
                                <Text style={[styles.viewShopLink, { color: theme.colors.primary }]}>Voir la vitrine</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    )}

                    {/* C. Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
                        <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                            {currentAnnonce.description || "Aucune description fournie pour cet article."}
                        </Text>
                    </View>

                    <View style={{ height: 100 }} />

                </ScrollView>

                {/* D. Barre d'Actions (Fixe en bas du Sheet) */}
                <View style={[styles.actionBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>

                    {isOwner ? (
                        // --- MODE PROPRIÉTAIRE (Redesign) ---
                        <View style={styles.ownerActions}>
                            {/* 1. Bouton Supprimer (Gauche, Petit, Rouge) */}
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={22} color="#FFF" />
                            </TouchableOpacity>

                            {/* 2. Bouton Modifier (Milieu, Grand, Primary) */}
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn, { backgroundColor: theme.colors.primary }]} onPress={handleEdit}>
                                <Ionicons name="create-outline" size={20} color="#FFF" />
                                <Text style={styles.btnTextWhite}>Modifier</Text>
                            </TouchableOpacity>

                            {/* 3. Bouton Partager (Droite, Grand, Border) */}
                            <View style={[styles.actionBtn, styles.shareBtnOwner, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                                <ShareButton
                                    pagePath={pagePath}
                                    shareData={shareData}
                                    size={20}
                                    color={theme.colors.text}
                                >
                                    <Text style={{ marginLeft: 8, fontWeight: '600', color: theme.colors.text }}>Partager</Text>
                                </ShareButton>
                            </View>
                        </View>
                    ) : (
                        // --- MODE VISITEUR (Redesign) ---
                        <View style={styles.visitorActions}>
                            {/* 1. WhatsApp (Gauche, 50%) */}
                            <WhatsAppButton
                                phoneNumber={vitrineInfo?.contact?.phone}
                                message={whatsappMessage}
                                style={{ flex: 1, marginRight: 8, height: 50 }}
                            />

                            {/* 2. Partager (Droite, 50%) */}
                            <View style={[styles.actionBtn, { flex: 1, marginLeft: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
                                <ShareButton
                                    pagePath={pagePath}
                                    shareData={shareData}
                                    size={22}
                                    color={theme.colors.text}
                                >
                                    <Text style={{ marginLeft: 8, fontWeight: '600', color: theme.colors.text }}>Partager</Text>
                                </ShareButton>
                            </View>
                        </View>
                    )}
                </View>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    carouselContainer: {
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    infoSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden', // Important pour le border radius
    },
    gripContainer: {
        paddingVertical: 12,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'transparent',
    },
    gripHandle: {
        width: 60,
        height: 5,
        borderRadius: 3,
        opacity: 0.4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // --- Header Section Styles ---
    headerSection: {
        marginTop: 5,
        marginBottom: 15,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        flex: 1,
        marginRight: 10,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateText: {
        fontSize: 10,
        marginLeft: 4,
        fontWeight: '600',
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.7,
    },
    locationText: {
        fontSize: 14,
        marginLeft: 4,
    },
    separator: {
        height: 1,
        width: '100%',
        opacity: 0.3,
        marginVertical: 10,
    },
    // --- Seller Card Styles ---
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginVertical: 10,
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    sellerLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    viewShopLink: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    // --- Description Styles ---
    descriptionSection: {
        marginTop: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'justify',
    },
    // --- Action Bar Styles ---
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        // Pour les écrans avec Home Indicator (iPhone X+)
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    ownerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    visitorActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    // --- Styles Propriétaire ---
    shareBtnOwner: {
        flex: 1,
        marginLeft: 10,
        borderWidth: 1,
    },
    editBtn: {
        flex: 1,
        marginLeft: 10,
    },
    deleteBtn: {
        width: 50, // Taille minimale fixe pour le bouton supprimer
        backgroundColor: '#FF4444',
    },
    btnTextWhite: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },
    // Le style `shareWrapper` est obsolète avec le nouveau flex layout
});