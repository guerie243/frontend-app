/**
 * EditProfileScreen - Édition du Profil avec Action Gating
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * ACTION GATING : Cet écran nécessite une authentification
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { GuestPrompt } from '../../components/GuestPrompt';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../store/useUserStore';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { userService } from '../../services/userService';
import ImageUploadAvatar from '../../components/ImageUploadAvatar';

export const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated, isGuest } = useAuth();
    const { user } = useUserStore();
    const { theme } = useTheme();

    const [profileName, setProfileName] = useState(user?.profileName || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * ACTION GATING : Vérification de l'authentification
     */
    const handleUpdate = async () => {
        if (isGuest) {
            Alert.alert(
                'Connexion requise',
                'Vous devez être connecté pour modifier votre profil.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsLoading(true);
        try {
            const updates: any = {};
            if (profileName !== user?.profileName) updates.profileName = profileName;
            if (phoneNumber !== user?.phoneNumber) updates.phoneNumber = phoneNumber;
            if (profilePhoto !== user?.profilePhoto) updates.profilePhoto = profilePhoto; // URI locale ou nouvelle URL
            if (password) updates.password = password;

            if (Object.keys(updates).length === 0) {
                Alert.alert('Info', 'Aucune modification à enregistrer');
                setIsLoading(false);
                return;
            }

            const response = await userService.updateProfile(updates);

            if (response.success) {
                Alert.alert('Succès', 'Profil modifié avec succès');
                // Optionnellement mettre à jour le store ici ou laisser l'app se rafraîchir
                navigation.goBack();
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erreur', error.response?.data?.message || 'Échec de la modification du profil');
        } finally {
            setIsLoading(false);
        }
    };

    if (isGuest) {
        return (
            <ScreenWrapper>
                <View style={styles.guestContainer}>
                    <GuestPrompt
                        message="Vous devez être connecté pour modifier votre profil"
                        variant="card"
                    />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Modifier le Profil</Text>

                <View style={styles.avatarContainer}>
                    <ImageUploadAvatar
                        initialImage={profilePhoto}
                        onUploadSuccess={(uri) => setProfilePhoto(uri)}
                        size={120}
                    />
                </View>

                <CustomInput
                    label="Nom complet"
                    value={profileName}
                    onChangeText={setProfileName}
                />

                <CustomInput
                    label="Numéro de téléphone"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

                <CustomInput
                    label="Nouveau mot de passe (optionnel)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Laisser vide pour conserver l'actuel"
                />

                <CustomButton
                    title="Enregistrer les modifications"
                    onPress={handleUpdate}
                    isLoading={isLoading}
                    style={styles.button}
                />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    guestContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    button: {
        marginTop: 24,
    },
});
