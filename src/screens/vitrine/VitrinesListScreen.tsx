/**
 * VitrinesListScreen - Liste des Vitrines avec Action Gating
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * Comportement :
 * - INVITÉS : Peuvent voir toutes les vitrines, mais voient GuestPrompt au lieu du bouton "Créer"
 * - AUTHENTIFIÉS : Voient leurs vitrines + bouton "Créer"
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines } from '../../hooks/useVitrines';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { StateMessage } from '../../components/StateMessage';
import { LoadingComponent } from '../../components/LoadingComponent';

export const VitrinesListScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { vitrines, isLoading, fetchMyVitrines } = useVitrines();
    const { isAuthenticated, isGuest } = useAuth();

    useEffect(() => {
        // Charger les vitrines uniquement si l'utilisateur est authentifié
        if (isAuthenticated) {
            fetchMyVitrines();
        }
    }, [isAuthenticated, fetchMyVitrines]);

    /**
     * Gestion du clic sur "Créer une vitrine"
     * ACTION GATING : Vérification de l'authentification avant navigation
     */
    const handleCreatePress = () => {
        if (isGuest) {
            // L'utilisateur invité ne devrait pas voir ce bouton
            // Mais par sécurité, on ne fait rien
            return;
        }
        navigation.navigate('CreateEditVitrine');
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('VitrineDetail', { slug: item.slug })}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.cardCategory, { color: theme.colors.primary }]}>{item.category}</Text>
            {item.description && (
                <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                </Text>
            )}
        </TouchableOpacity>
    );

    if (isLoading && vitrines.length === 0) {
        return <LoadingComponent />;
    }

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {isAuthenticated ? 'Mes Vitrines' : 'Vitrines'}
                </Text>

                {/* ACTION GATING : Bouton créer visible uniquement pour utilisateurs authentifiés */}
                {isAuthenticated && (
                    <TouchableOpacity onPress={handleCreatePress}>
                        <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* GUEST PROMPT : Invitation pour les invités */}
            {isGuest && (
                <GuestPrompt
                    message="Connectez-vous pour créer et gérer vos propres vitrines"
                    variant="card"
                />
            )}

            {/* Liste des vitrines (uniquement pour authentifiés) */}
            {isAuthenticated && (
                <FlatList
                    data={vitrines}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.vitrineId}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={fetchMyVitrines}
                            tintColor={theme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <StateMessage
                                type="empty"
                                message="Vous n'avez pas encore de vitrine. Créez-en une pour commencer à vendre !"
                                icon="storefront-outline"
                            />
                        ) : null
                    }
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 32,
        fontWeight: '700',
    },
    menuButton: {
        padding: 8,
    },
    listContent: {
        paddingBottom: 32,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    cardCategory: {
        fontSize: 12,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 48,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
