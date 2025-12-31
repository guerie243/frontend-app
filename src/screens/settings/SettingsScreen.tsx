/**
 * SettingsScreen - Paramètres avec Action Gating
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * Comportement :
 * - INVITÉS : Voient les préférences + bouton "Se connecter"
 * - AUTHENTIFIÉS : Voient profil + préférences + bouton "Déconnexion"
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GuestPrompt } from '../../components/GuestPrompt';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../../components/CustomButton';

import { useUserStore } from '../../store/useUserStore';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { logout, isAuthenticated, isGuest } = useAuth();
    const { user, fetchUser } = useUserStore();
    const { theme, toggleTheme, themeType } = useTheme();
    const isFocused = useIsFocused();

    React.useEffect(() => {
        if (isFocused && isAuthenticated) {
            fetchUser();
        }
    }, [isFocused, isAuthenticated, fetchUser]);

    const renderSectionHeader = (title: string) => (
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{title}</Text>
    );

    const renderItem = (label: string, onPress?: () => void, rightElement?: React.ReactNode, icon?: any) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.itemLeft}>
                {icon && <Ionicons name={icon} size={20} color={theme.colors.text} style={styles.itemIcon} />}
                <Text style={[styles.itemLabel, { color: theme.colors.text }]}>{label}</Text>
            </View>
            {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />)}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Paramètres</Text>

                {/* SECTION COMPTE - Visible uniquement pour authentifiés */}
                {isAuthenticated && (
                    <>
                        {/* Profile Card */}
                        <TouchableOpacity
                            style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => navigation.navigate('ProfileDetail')}
                        >
                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user?.profileName ? user.profileName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                                    {user?.profileName || 'Utilisateur'}
                                </Text>
                                <Text style={[styles.profileUsername, { color: theme.colors.textSecondary }]}>
                                    @{user?.username || 'username'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {renderSectionHeader('COMPTE')}
                        {/* Removed duplicate EditProfile link as it's on the card now */}
                    </>
                )}

                {/* GUEST PROMPT - Visible uniquement pour invités */}
                {isGuest && (
                    <>
                        {renderSectionHeader('COMPTE')}
                        <GuestPrompt
                            message="Connectez-vous pour accéder à votre profil et gérer vos vitrines"
                            variant="card"
                        />
                    </>
                )}

                {/* SECTION PRÉFÉRENCES - Visible pour tous */}
                {renderSectionHeader('PRÉFÉRENCES')}
                {renderItem(
                    'Mode sombre',
                    toggleTheme,
                    <Switch
                        value={themeType === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                    />,
                    'moon-outline'
                )}

                {/* SECTION LÉGAL - Visible pour tous */}
                {renderSectionHeader('LÉGAL & INFO')}
                {renderItem('Conditions d\'utilisation', () => navigation.navigate('TermsOfService'), null, 'document-text-outline')}
                {renderItem('Politique de confidentialité', () => navigation.navigate('PrivacyPolicy'), null, 'shield-checkmark-outline')}
                {renderItem(
                    'À propos',
                    () => { },
                    <Text style={{ color: theme.colors.textSecondary }}>v1.0.0</Text>,
                    'information-circle-outline'
                )}

                {/* BOUTON DÉCONNEXION - Visible uniquement pour authentifiés */}
                {isAuthenticated && (
                    <View style={styles.logoutContainer}>
                        <CustomButton
                            title="Se déconnecter"
                            onPress={logout}
                            variant="danger"
                            style={styles.logoutButton}
                        />
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    profileUsername: {
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
    },
    logoutContainer: {
        marginTop: 32,
    },
    logoutButton: {
        width: '100%',
    },
});
