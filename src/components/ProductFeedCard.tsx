import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ShareButton } from './ShareButton';
import { WhatsAppButton } from './WhatsAppButton';
import { ProductImageGrid } from './ProductImageGrid';
import { Annonce } from '../types';
import Avatar from './Avatar';
import { useVitrines } from '../hooks/useVitrines';
import { Ionicons } from '@expo/vector-icons';
import { getRelativeTime } from '../utils/dateUtils';
import { ENV } from '../config/env';
import { DEFAULT_IMAGES } from '../constants/images';
import { LikeButton } from './LikeButton';

// Dimensions
const { width } = Dimensions.get('window');

interface VitrineInfo {
    name: string;
    logoSource: any;
    contactPhone: string;
}

interface ProductFeedCardProps {
    annonce: Annonce;
    onCardPress: () => void;
    onVitrinePress: (slug: string) => void;
}

export const ProductFeedCard: React.FC<ProductFeedCardProps> = ({ annonce, onCardPress, onVitrinePress }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const { fetchVitrineBySlug } = useVitrines();

    const [vitrineInfo, setVitrineInfo] = useState<VitrineInfo | null>(null);
    const [isLoadingVitrine, setIsLoadingVitrine] = useState(true);

    if (!annonce || !annonce.slug) {
        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, height: 100 }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    // --- Logique de chargement Vitrine (Inchangée) ---
    useEffect(() => {
        let isMounted = true;
        const getVitrineData = async () => {
            const vitrineIdentifier = annonce.vitrineId || annonce.vitrineSlug;
            if (vitrineIdentifier) {
                if (isMounted) setIsLoadingVitrine(true);
                try {
                    // fetchVitrineBySlug might need to be renamed or overloaded to handle ID
                    const vitrineData = await fetchVitrineBySlug(vitrineIdentifier);
                    if (vitrineData && isMounted) {
                        const logo = vitrineData.logo || vitrineData.avatar;
                        setVitrineInfo({
                            name: vitrineData.name || 'Vitrine Pro',
                            logoSource: logo ? { uri: logo } : DEFAULT_IMAGES.avatar,
                            contactPhone: vitrineData.contact?.phone || '',
                        });
                    }
                } catch (error) {
                    console.error("Erreur chargement vitrine:", error);
                } finally {
                    if (isMounted) setIsLoadingVitrine(false);
                }
            } else {
                if (isMounted) setIsLoadingVitrine(false);
            }
        };
        getVitrineData();
        return () => { isMounted = false; };
    }, [annonce.vitrineId, annonce.vitrineSlug, fetchVitrineBySlug]);

    // --- DONNÉES SÉCURISÉES ---
    const vitrineName = vitrineInfo?.name || 'Vendeur Inconnu';
    const vitrineLogoSource = vitrineInfo?.logoSource || DEFAULT_IMAGES.avatar;
    const vitrinePhone = vitrineInfo?.contactPhone;

    // Lien public spécifique à l'annonce (le 'pagePath')
    const pagePath = `a/${annonce.slug}`;
    const fullUrl = `${ENV.SHARE_BASE_URL}/${pagePath}`;

    // Données pour le ShareButton
    const shareData = {
        title: annonce.title || 'Produit sans titre',
        price: annonce.price as number,
        currency: annonce.currency || 'USD',
        vitrineName: vitrineName,
    };

    const title = annonce.title || 'Produit sans titre';
    const price = annonce.price ? `${annonce.price} ${annonce.currency || 'USD'}` : 'Prix sur demande';
    const lastModified = annonce.updatedAt || annonce.createdAt;

    // --- Construction des Locations (Inchangée) ---
    let displayLocations = '';
    let otherCount = 0;

    if (annonce.locations) {
        let allLocs: string[] = [];
        if (Array.isArray(annonce.locations)) {
            allLocs = annonce.locations;
        } else if (typeof annonce.locations === 'string') {
            allLocs = (annonce.locations as unknown as string).split(',').map((l: string) => l.trim()).filter(Boolean);
        }
        if (allLocs.length > 0) {
            const first3 = allLocs.slice(0, 3);
            displayLocations = first3.join(', ');
            if (allLocs.length > 3) {
                otherCount = allLocs.length - 3;
            }
        }
    }
    const locationText = displayLocations ? `${displayLocations}${otherCount > 0 ? ` (+${otherCount} autres)` : ''}` : null;


    // ✅ NOUVEAU MESSAGE WHATSAPP EXPLICITE
    const priceText = annonce.price ? ` pour ${price}` : '';

    const whatsappMessage =
        `Bonjour, j'ai vu sur Andy votre annonce: "${title}"${priceText}.\n` +
        `Je suis intéressé. Pourriez-vous me donner plus de détails ?\n\n` +
        `Lien de l'annonce : ${fullUrl}`;


    // --- RENDU ---
    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* 1. Séparateur de carte (HAUT) */}
            <View style={[styles.cardSeparatorTop, { backgroundColor: theme.colors.border }]} />

            {/* 2. En-tête Vendeur */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => annonce.vitrineSlug && onVitrinePress(annonce.vitrineSlug)}
            >
                <Avatar size={40} source={vitrineLogoSource} style={styles.profilePic} />
                <View style={styles.headerTextContainer}>
                    <Text style={[styles.sellerName, { color: theme.colors.text }]} numberOfLines={1}>
                        {isLoadingVitrine ? 'Chargement...' : vitrineName}
                    </Text>

                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.timeLocationText, { color: theme.colors.textSecondary }]}>
                            {getRelativeTime(lastModified)}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                />
            </TouchableOpacity>


            <View style={[styles.thinSeparator, { backgroundColor: theme.colors.border }]} />

            {/* 3. Grille d'images Facebook Style */}
            <ProductImageGrid
                images={annonce.images as string[] || []}
                onPress={onCardPress}
            />

            <View style={[styles.thinSeparator, { backgroundColor: theme.colors.border }]} />

            {/* 4. Détails Cliquables */}
            <TouchableOpacity style={styles.detailsContainer} activeOpacity={0.9} onPress={onCardPress}>
                <View style={styles.titlePriceRow}>
                    <Text style={[styles.productTitle, { color: theme.colors.text }]}>
                        {title}
                    </Text>
                    <Text style={[styles.productPriceText, { color: theme.colors.primary, marginRight: 8 }]}>{price}</Text>
                </View>

                {(locationText && locationText.trim() !== '') ? (
                    <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.locationText, { color: theme.colors.text, fontWeight: '600' }]}>
                            {locationText}
                        </Text>
                    </View>
                ) : null}

                {!!annonce.description && (
                    <Text
                        style={[styles.description, { color: theme.colors.textSecondary }]}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                    >
                        {annonce.description}
                    </Text>
                )}
            </TouchableOpacity>


            {/* 5. Actions (WhatsApp/Partager/Like) */}
            <View style={[styles.actionsContainer, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }]}>
                {vitrinePhone ? (
                    <WhatsAppButton
                        phoneNumber={vitrinePhone}
                        style={styles.whatsappButton}
                        // ✅ PASSAGE DU MESSAGE EXPLICITE ET COMPLET
                        message={whatsappMessage}
                    />
                ) : (
                    <View style={[styles.whatsappButton, styles.whatsappDisabled]}>
                        <Ionicons name="call-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Contacter</Text>
                    </View>
                )}

                {/* Bouton Partager */}
                <View style={[styles.shareButtonContainer, { borderColor: theme.colors.border }]}>
                    <ShareButton
                        pagePath={pagePath}
                        shareData={shareData}
                        size={20}
                        color={theme.colors.textSecondary}
                        style={styles.feedCardShareButton}
                    >
                        <Text style={[styles.shareButtonText, { color: theme.colors.textSecondary }]}>Partager</Text>
                    </ShareButton>
                </View>

                {/* Bouton Like */}
                <View style={styles.likeButtonContainer}>
                    <LikeButton
                        annonceId={annonce.annonceId}
                        annonceSlug={annonce.slug}
                        initialLikesCount={annonce.likes_count || 0}
                        size={24}
                    />
                </View>
            </View>
        </View>
    );
};

// --- Styles (Inchangés) ---

// --- Styles ---
const createStyles = (theme: any) => StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        // Espace très fin de part et d'autre (ex: 4px)
        marginHorizontal: 4,
        marginVertical: theme.spacing.s,
        overflow: 'hidden',
        // Minimalist border for dark mode hierarchy specifically
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardSeparatorTop: {
        height: 1,
        width: '100%',
        backgroundColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    profilePic: {},
    headerTextContainer: {
        flex: 1,
        marginLeft: theme.spacing.s,
        justifyContent: 'center',
    },
    sellerName: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    timeLocationText: {
        ...theme.typography.caption,
        marginLeft: 4,
    },
    thinSeparator: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
        backgroundColor: theme.colors.border,
    },
    detailsContainer: {
        padding: theme.spacing.m,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        flex: 1,
        marginRight: theme.spacing.s,
    },
    productPriceText: {
        ...theme.typography.h3,
        fontSize: 18, // Override size but keep font family
        color: theme.colors.primary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    locationText: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: '600',
    },
    description: {
        ...theme.typography.bodySmall,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border,
    },
    whatsappButton: {
        flex: 1,
        marginRight: theme.spacing.s,
        height: 40,
        borderRadius: theme.borderRadius.s,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    whatsappDisabled: {
        backgroundColor: theme.colors.textSecondary, // Use theme token instead of 'gray'
        opacity: 0.5,
    },
    likeButtonContainer: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderRadius: theme.borderRadius.s,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: theme.colors.border,
    },
    shareButtonContainer: {
        width: 100, // Slightly smaller to look cleaner
        height: 40,
        borderWidth: 1,
        borderRadius: theme.borderRadius.s,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: theme.colors.border,
        marginRight: theme.spacing.s,
    },
    feedCardShareButton: {
        paddingHorizontal: theme.spacing.s,
    },
    shareButtonText: {
        ...theme.typography.button,
        fontSize: 14,
        marginLeft: 4,
    },
});