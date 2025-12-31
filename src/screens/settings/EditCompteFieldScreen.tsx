import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import api from '../../services/api';

export const EditCompteFieldScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const { fetchUser } = useUserStore(); // Pour mettre à jour le store après modif

    // field: 'profileName', 'phoneNumber', 'password'
    const { field, label, currentValue, keyboardType, secureTextEntry, editable } = route.params;

    const [value, setValue] = useState(currentValue || '');
    const [isLoading, setIsLoading] = useState(false);

    if (editable === false) {
        Alert.alert('Info', 'Ce champ n\'est pas modifiable.');
        navigation.goBack();
        return null;
    }

    const handleSave = async () => {
        if (!value.toString().trim() && field !== 'password') { // Password peut être vide si on annule ? Non, on est sur un écran d'édition
            Alert.alert('Erreur', 'Le champ ne peut pas être vide');
            return;
        }

        setIsLoading(true);
        try {
            const updates = { [field]: value.trim() };
            console.log("1. [EditCompteField] PATCH User:", updates);

            await api.patch('/users/', updates);

            // Mettre à jour le store localement ou re-fetch
            await fetchUser();

            console.log("2. [EditCompteField] ✅ Succès");

            const refreshTimestamp = Date.now();
            navigation.navigate('CompteModificationMain', { refreshed: refreshTimestamp });

        } catch (error: any) {
            console.error("❌ [EditCompteField] Erreur:", error);
            Alert.alert('Erreur', error.response?.data?.message || 'Impossible de mettre à jour le profil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Modifier {label}</Text>

                    <CustomInput
                        label={label}
                        value={value}
                        onChangeText={setValue}
                        keyboardType={keyboardType || 'default'}
                        secureTextEntry={secureTextEntry}
                        autoFocus
                    />

                    <CustomButton
                        title="Enregistrer"
                        onPress={handleSave}
                        isLoading={isLoading}
                        style={styles.button}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    button: { marginTop: 24 },
});
