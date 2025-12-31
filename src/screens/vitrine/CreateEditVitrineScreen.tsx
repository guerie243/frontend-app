/**
 * CreateEditVitrineScreen - Création/Édition de Vitrine avec Action Gating
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * ACTION GATING : Cet écran entier nécessite une authentification
 * Si un invité y accède (ne devrait pas arriver), afficher GuestPrompt
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SimpleSelect, SelectOption } from "../../components/AnimatedSelect"; // adapte le chemin si besoin
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { GuestPrompt } from '../../components/GuestPrompt';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useVitrines } from '../../hooks/useVitrines';

export const CreateEditVitrineScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const { createVitrine, updateVitrine } = useVitrines();
    const { isAuthenticated, isGuest } = useAuth();

    const isEditing = !!route.params?.slug;
    const existingVitrine = route.params?.vitrine;

    const [name, setName] = useState(existingVitrine?.name || '');
    const [description, setDescription] = useState(existingVitrine?.description || '');
    const [category, setCategory] = useState(existingVitrine?.category || '');
    const [phone, setPhone] = useState(existingVitrine?.contact?.phone || '');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * ACTION GATING : Vérification de l'authentification avant soumission
     * Cette vérification est redondante car l'écran ne devrait pas être accessible aux invités,
     * mais elle ajoute une couche de sécurité
     */
    const handleSubmit = async () => {
        // Vérification de l'authentification
        if (isGuest) {
            Alert.alert(
                'Connexion requise',
                'Vous devez être connecté pour créer ou modifier une vitrine.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!name || !category) {
            Alert.alert('Erreur', 'Le nom et la catégorie sont requis');
            return;
        }

        setIsLoading(true);
        try {
            const vitrineData = {
                name,
                description,
                category,
                contact: {
                    phone,
                },
            };

            if (isEditing) {
                await updateVitrine(route.params.slug, vitrineData);
                Alert.alert('Succès', 'Vitrine modifiée avec succès');
            } else {
                await createVitrine(vitrineData);
                Alert.alert('Succès', 'Vitrine créée avec succès');
            }

            navigation.goBack();
        } catch (error) {
            // Erreur gérée dans le hook
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Si l'utilisateur est invité, afficher le GuestPrompt
     * au lieu du formulaire
     */
    if (isGuest) {
        return (
            <ScreenWrapper>
                <View style={styles.guestContainer}>
                    <GuestPrompt
                        message="Vous devez être connecté pour créer ou modifier une vitrine"
                        variant="card"
                    />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {isEditing ? 'Modifier la Vitrine' : 'Créer une Vitrine'}
                </Text>

                <CustomInput
                    label="Nom de la vitrine *"
                    placeholder="ex: Ma Boutique"
                    value={name}
                    onChangeText={setName}
                />

                <SimpleSelect
                    label="Catégorie *"
                    options={[
                        { name: "Mode", slug: "Mode", imageUri: null },
                        { name: "Électronique", slug: "Électronique", imageUri: null },
                        { name: "Maison", slug: "Maison", imageUri: null },
                        { name: "Sports", slug: "Sports", imageUri: null },
                        { name: "Autre", slug: "Autre", imageUri: null }
                    ]}
                    value={category}
                    onChange={setCategory}
                />

                <CustomInput
                    label="Description"
                    placeholder="Décrivez votre boutique..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={10}
                    style={styles.textArea}
                />

                <CustomInput
                    label="Numéro WhatsApp"
                    placeholder="+33612345678"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <CustomButton
                    title={isEditing ? 'Modifier la Vitrine' : 'Créer la Vitrine'}
                    onPress={handleSubmit}
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
    textArea: {
        height: 350,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    button: {
        marginTop: 24,
    },
});
