import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused, useRoute, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useVitrines } from '../../hooks/useVitrines';
import { Vitrine } from '../../types';

export const VitrineModificationMain = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const isFocused = useIsFocused();
    const { vitrines, fetchMyVitrines, isLoading, error: hookError } = useVitrines();

    const [vitrine, setVitrine] = useState<Vitrine | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Extract refresh parameter from navigation
    const { refreshed } = route.params || {};

    console.log("7. [VitrineManagement] Rendu déclenché - refreshed param:", refreshed);

    // Use useFocusEffect to ALWAYS reload when screen comes into focus
    // This is more reliable than useEffect for navigation-based refreshes
    useFocusEffect(
        React.useCallback(() => {
            const loadVitrine = async () => {
                try {
                    if (refreshed) {
                        console.log("🔄 [VitrineManagement] Rafraîchissement après édition - refreshed:", refreshed);
                    } else {
                        console.log("📥 [VitrineManagement] Chargement initial");
                    }

                    await fetchMyVitrines();
                } catch (err: any) {
                    console.error("❌ [VitrineManagement] Erreur de chargement:", err);
                    setError(err.message || "Erreur de chargement");
                }
            };

            loadVitrine();
        }, [refreshed]) // Re-run when refreshed param changes
    );

    // Mettre à jour la vitrine affichée quand les vitrines changent dans le hook
    useEffect(() => {
        // Ne mettre à jour que si le chargement est terminé
        if (!isLoading) {
            if (vitrines && vitrines.length > 0) {
                setVitrine(vitrines[0]);
                setError(null); // Réinitialiser l'erreur si on a des vitrines
                console.log("✅ [VitrineManagement] Vitrine mise à jour depuis le hook:", {
                    name: vitrines[0].name,
                    slug: vitrines[0].slug,
                    category: vitrines[0].category,
                    type: vitrines[0].type,
                    description: vitrines[0].description,
                    phone: vitrines[0].contact?.phone,
                    email: vitrines[0].contact?.email
                });
            } else if (vitrines.length === 0 && !hookError) {
                // Afficher l'erreur seulement si le chargement est terminé et qu'il n'y a pas d'erreur du hook
                setVitrine(null);
                setError("Aucune vitrine trouvée");
            }
        }
    }, [vitrines, isLoading, hookError]);


    const renderFieldItem = (label: string, value: string, field: string, options: any = {}) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: theme.colors.border }]}
            onPress={() => navigation.navigate('EditVitrineField', {
                field,
                label,
                currentValue: value,
                slug: vitrine?.slug,
                ...options
            })}
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

    if (isLoading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Chargement...
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // Afficher l'erreur seulement si le chargement est terminé et qu'il y a une erreur ou aucune vitrine
    if (!isLoading && (hookError || error || !vitrine)) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
                    <Text style={[styles.errorText, { color: theme.colors.text }]}>
                        {hookError || error || 'Aucune vitrine trouvée'}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // Si on arrive ici, on a une vitrine et on n'est pas en train de charger
    if (!vitrine) {
        return null; // Sécurité supplémentaire
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Gestion de la Vitrine</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Informations Générales */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Informations Générales</Text>

                    {renderFieldItem('Nom', vitrine.name, 'name')}
                    {renderFieldItem("Nom d'utilisateur", vitrine.slug || '', 'slug')}
                    {renderFieldItem('Catégorie', vitrine.category || vitrine.type || '', 'category')}
                    {renderFieldItem('Bio', vitrine.description || '', 'description', { multiline: true })}
                </View>

                {/* Localisation */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Localisation</Text>

                    {renderFieldItem('Adresse', vitrine.address || '', 'address', { multiline: true })}
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Contact</Text>

                    {renderFieldItem('Téléphone', vitrine.contact?.phone || '', 'phone', { keyboardType: 'phone-pad' })}
                    {renderFieldItem('Email', vitrine.contact?.email || '', 'email', { keyboardType: 'email-address' })}
                </View>

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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
