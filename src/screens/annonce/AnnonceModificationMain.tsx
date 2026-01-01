/**
 * AnnonceManagementScreen - Gestion détaillée d'une annonce.
 * Affiche les champs d'une annonce et permet la navigation vers l'édition.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAnnonces } from '../../hooks/useAnnonces';
import { Annonce } from '../../types'; // Assurez-vous que le type Annonce est défini

export const AnnonceModificationMain = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const { fetchAnnonceBySlug, isLoading, error: hookError } = useAnnonces();

    // Récupère le slug de l'annonce et de la vitrine
    const { annonceSlug, vitrineSlug } = route.params || {};

    const [annonce, setAnnonce] = useState<Annonce | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour charger ou recharger l'annonce
    const loadAnnonce = React.useCallback(async () => {
        if (!annonceSlug || !vitrineSlug) {
            setError("Paramètres d'annonce manquants.");
            return;
        }

        setError(null);
        try {
            console.log(`📥 [AnnonceManagement] Chargement de l'annonce: ${annonceSlug}`);
            // Assurez-vous que fetchAnnonceBySlug n'a besoin que du slug de l'annonce
            const fetchedAnnonce = await fetchAnnonceBySlug(annonceSlug);
            setAnnonce(fetchedAnnonce);
        } catch (err: any) {
            console.error("❌ [AnnonceManagement] Erreur de chargement:", err);
            setError(err.message || "Erreur de chargement de l'annonce");
        }
    }, [annonceSlug, vitrineSlug, fetchAnnonceBySlug]);

    // Rechargement au focus, notamment après une édition (paramètre 'refreshed')
    useFocusEffect(
        React.useCallback(() => {
            loadAnnonce();
        }, [loadAnnonce]) // Dépendances importantes
    );

    const formatPrice = (price: number | undefined, currency: string | undefined) => {
        if (price === undefined || price === null) return 'Non renseigné';
        const formattedCurrency = currency || 'EUR';

        // Utilisation de toLocaleString pour un meilleur formatage
        return price.toLocaleString('fr-FR', {
            style: 'currency',
            currency: formattedCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    };

    const renderFieldItem = (label: string, value: string, field: string, options: any = {}) => (
        <TouchableOpacity
            key={field} // Ajout d'une clé pour les listes de composants
            style={[styles.item, { borderBottomColor: theme.colors.border }]}
            onPress={() => {
                if (!annonce) return;
                navigation.navigate('EditAnnonceField', {
                    field,
                    label,
                    currentValue: value,
                    annonceSlug: annonce.slug,
                    vitrineSlug: annonce.vitrineSlug,
                    ...options
                });
            }}
        >
            <View style={styles.itemContent}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.value, { color: value ? theme.colors.text : theme.colors.textTertiary }]} numberOfLines={1}>
                    {value || 'Non renseigné'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    if (isLoading && !annonce) { // Afficher l'indicateur uniquement si l'annonce n'est pas encore chargée
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Chargement de l&apos;annonce...
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (hookError || error || !annonce) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
                    <Text style={[styles.errorText, { color: theme.colors.text }]}>
                        {hookError || error || "Annonce introuvable."}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        Gestion: {annonce.title}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Aperçu de l'Annonce */}


                {/* ✅ Détails de l'Annonce (Correction: Ajout de la View manquante) */}
                <View style={styles.section}>
                    {renderFieldItem('Titre', annonce.title, 'title')}
                    {renderFieldItem('Catégorie', annonce.category || 'Category et type', 'category')}
                    {renderFieldItem(
                        'Prix',
                        formatPrice(annonce.price, annonce.currency),
                        'price'
                    )}
                    {renderFieldItem('Devise', annonce.currency || 'USD', 'currency')}
                    {renderFieldItem('Lieux', (Array.isArray(annonce.locations) ? annonce.locations.join(', ') : (typeof annonce.locations === 'string' ? annonce.locations : '')) || '', 'locations')}
                    {renderFieldItem('Description', annonce.description || '', 'description', { multiline: true })}
                    {/* Ajout du champ Images */}
                    {renderFieldItem('Images', `${(annonce.images || []).length} photo(s)`, 'images', { initialImages: annonce.images })}
                </View>

                {/* Suppression de la section Description et Lien redondante */}
                {/* <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Description et Lien</Text>

                    {renderFieldItem('Description', annonce.description || '', 'description', { multiline: true })}
                    {renderFieldItem('Lien', annonce.link || '', 'link')}
                </View> */}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemContent: {
        flex: 1,
        marginRight: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    // Ajout des styles manquants pour l'aperçu
    previewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    previewDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    previewLocations: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    previewCategory: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    }
});