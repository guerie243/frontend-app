/**
 * CreateAnnonceScreen - Création d'Annonce Simplifiée
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, TextInput, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { GuestPrompt } from '../../components/GuestPrompt';
import { useTheme } from '../../context/ThemeContext';
import { useAnnonces } from '../../hooks/useAnnonces';
import { useAuth } from '../../hooks/useAuth';
import { useVitrines } from '../../hooks/useVitrines';

// ✅ Imports des sélecteurs
// ✅ Imports des sélecteurs
import { CascadingSelects, SimpleSelect, CascadingParentOption, CascadingChildOption, SelectOption } from '../../components/AnimatedSelect';
// Import du composant ImageUploader
import ImageUploader from '../../components/ImagePictureUploader';
import { ANNONCE_CATEGORIES_FORMATTED } from '../../Data/annoncetypes';
import { CURRENCY_OPTIONS } from '../../Data/currencies';

interface RawCategorySection {
    title: string;
    slug: string;
    data: { name: string; slug: string; imageUri: string | null; }[];
}


export const CreateAnnonceScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { createAnnonce } = useAnnonces();
    const { isAuthenticated, isGuest } = useAuth();
    const { vitrines, fetchMyVitrines } = useVitrines();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // Le prix n'est plus obligatoire
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState<string>('USD');
    const [locations, setLocations] = useState('');

    const [parentCategorySlug, setParentCategorySlug] = useState<string | null>(null);
    const [childCategorySlug, setChildCategorySlug] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    const [images, setImages] = useState<any[]>([]);

    const userVitrine = vitrines && vitrines.length > 0 ? vitrines[0] : null;

    const cascadingCategories: CascadingParentOption[] = useMemo(() => {
        const rawCategories = (ANNONCE_CATEGORIES_FORMATTED || []) as RawCategorySection[];

        if (!Array.isArray(rawCategories)) return [];

        return rawCategories.map(section => ({
            name: section.title,
            slug: section.slug,
            imageUri: null,

            children: Array.isArray(section.data) ? section.data.map(item => ({
                name: item.name,
                slug: item.slug,
                imageUri: item.imageUri,
            })) as CascadingChildOption[] : [],
        }));
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyVitrines();
        }
    }, [isAuthenticated, fetchMyVitrines]);


    const handleSubmit = async () => {
        if (isGuest) {
            return Alert.alert(
                'Connexion requise',
                'Vous devez être connecté pour créer une annonce.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
                ]
            );
        }

        if (!userVitrine) {
            const isVitrinesLoading = vitrines === null || vitrines === undefined;
            if (isVitrinesLoading) {
                return Alert.alert('Patientez', 'Chargement de votre vitrine en cours...');
            }
            return Alert.alert(
                'Vitrine requise',
                'Vous devez créer une vitrine avant de pouvoir publier une annonce.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Créer ma Vitrine', onPress: () => navigation.navigate('CreateVitrine') }
                ]
            );
        }

        // ❌ Validation: 2 à 5 photos obligatoires -> 1 minimum
        if (images.length < 1) {
            return Alert.alert('Erreur', 'Veuillez ajouter au moins 1 image pour votre annonce.');
        }
        if (images.length > 5) {
            return Alert.alert('Erreur', 'Vous ne pouvez pas ajouter plus de 5 images.');
        }

        // ✅ Validation: Le prix n'est plus obligatoire, mais le titre et la catégorie le sont.
        if (!title || !parentCategorySlug) {
            return Alert.alert('Erreur', 'Le titre et la catégorie sont requis.');
        }

        setIsLoading(true);
        try {
            const categoryToSend = childCategorySlug || parentCategorySlug;
            const dataToSend = {
                vitrineSlug: userVitrine.slug,
                title,
                description,
                price: price || '0',
                currency,
                category: categoryToSend,
                locations: locations || '',
                images: images // Will be converted to FormData by the service because it contains local URIs
            };

            await createAnnonce(dataToSend as any);

            // Succès
            if (Platform.OS === 'web') {
                // Sur Web, Alert.alert ne supporte pas bien les callbacks.
                // On utilise window.confirm ou window.alert puis on navigue.
                window.alert('Annonce créée avec succès !');

                // Exécution immédiate de la logique de succès
                setTitle('');
                setDescription('');
                setPrice('');
                setCurrency('EUR');
                setImages([]);
                setParentCategorySlug(null);
                setChildCategorySlug(null);
                setLocations('');

                navigation.navigate('VitrineDetail', {
                    refresh: Date.now(),
                    slug: userVitrine.slug
                });
            } else {
                // Native : on garde l'Alert avec callback
                Alert.alert('Succès', 'Annonce créée avec succès', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setTitle('');
                            setDescription('');
                            setPrice('');
                            setCurrency('EUR');
                            setImages([]);
                            setParentCategorySlug(null);
                            setChildCategorySlug(null);
                            setLocations('');
                            navigation.navigate('VitrineDetail', {
                                refresh: Date.now(),
                                slug: userVitrine.slug
                            });
                        }
                    }
                ]);
            }
        } catch (error: any) {
            console.error('Erreur création annonce:', error);
            Alert.alert('Erreur', error.message || 'Impossible de créer l\'annonce');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormDisabled = isSelectOpen || isLoading;

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    scrollEnabled={!isLoading}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Ajouter votre annonce
                    </Text>
                    {userVitrine && (
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Vitrine: {userVitrine.name}
                        </Text>
                    )}

                    {/* 1. UPLOADER D'IMAGE (Déplacé en premier) */}
                    <View style={[styles.imageUploaderContainer, { zIndex: 100 }]} pointerEvents={isSelectOpen ? 'none' : 'auto'}>
                        <Text style={[styles.imageUploaderTitle, { color: theme.colors.text }]}>
                            Photos (2 à 5 images)*
                        </Text>
                        <ImageUploader images={images} setImages={setImages} />
                    </View>

                    {/* 2. BLOC TITRE/INPUT - Désactivé si un selecteur est ouvert */}
                    <View style={{ zIndex: 90 }} pointerEvents={isSelectOpen ? 'none' : 'auto'}>
                        <CustomInput
                            label="Titre du produit *"
                            placeholder="ex: T-Shirt Premium"
                            value={title}
                            onChangeText={setTitle}
                            editable={!isFormDisabled}
                        />
                    </View>

                    {/* 3. CASCADING SELECTS (Catégorie) - Gère son état isSelectOpen */}
                    <View style={[styles.categoryContainer, { zIndex: 80 }]}>
                        {/* 
                            IMPORTANT: On ne met PAS pointerEvents="none" ici, 
                            sinon on ne peut plus interagir avec le sélecteur ouvert (Deadlock).
                        */}
                        <CascadingSelects
                            parentLabel="Catégorie Principale *"
                            childLabel="Sous-catégorie (Optionnel)"

                            parentOptions={cascadingCategories}
                            parentValue={parentCategorySlug}
                            onParentChange={setParentCategorySlug}

                            childValue={childCategorySlug}
                            onChildChange={setChildCategorySlug}

                            onToggleOpen={setIsSelectOpen}
                            disabled={isLoading}
                        />
                    </View>

                    {/* 4. PRIX / DEVISE */}
                    <View style={[styles.priceCurrencyWrapper, { zIndex: 70 }]}>
                        {/* 
                            On ne bloque pas le conteneur parent pour permettre l'interaction avec le SimpleSelect.
                            On bloque l'input de prix individuellement via pointerEvents si besoin, 
                            mais ici 'editable' suffit déjà pour CustomInput.
                         */}
                        <CustomInput
                            // Le prix est rendu optionnel ici
                            label="Prix (Optionnel)"
                            placeholder="0.00"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            editable={!isLoading && !isSelectOpen}
                            inputWrapperStyle={styles.priceInput}
                        />

                        <SimpleSelect
                            label="Devise *"
                            options={CURRENCY_OPTIONS}
                            value={currency}
                            onChange={setCurrency}
                            onToggleOpen={setIsSelectOpen}
                            disabled={isLoading}
                            zIndex={30}
                            style={styles.currencySelect}
                        />
                    </View>

                    {/* 5. BLOC DESCRIPTION/BOUTON - Désactivé si un selecteur est ouvert */}
                    <View style={{ zIndex: 60 }} pointerEvents={isSelectOpen ? 'none' : 'auto'}>

                        <Pressable onPress={() => {
                            setTempDescription(description);
                            setDescriptionModalVisible(true);
                        }}>
                            <CustomInput
                                label="Description"
                                placeholder="Description de l'annonce"
                                value={description}
                                editable={false}
                            // Suppression du style textArea qui causait un chevauchement (195px)
                            />
                        </Pressable>

                        <CustomInput
                            label="Lieux (optionnel)"
                            placeholder="ex: Lubumbashi, Kinshasa, Kolwezi (séparés par des virgules)"
                            value={locations}
                            onChangeText={setLocations}
                            editable={!isFormDisabled}
                        />

                        <CustomButton
                            title="Créer l'Annonce"
                            onPress={handleSubmit}
                            isLoading={isLoading}
                            // On bloque le bouton si on charge OU si un sélecteur est ouvert
                            disabled={isLoading || isSelectOpen}
                            style={styles.button}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* MODAL pour la Description */}
            <Modal
                visible={descriptionModalVisible}
                animationType="slide"
                onRequestClose={() => setDescriptionModalVisible(false)}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <KeyboardAvoidingView
                        style={{ flex: 1, backgroundColor: theme.colors.background }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Description du produit</Text>
                            <TextInput
                                style={[
                                    styles.modalTextInput,
                                    { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface }
                                ]}
                                multiline
                                value={tempDescription}
                                onChangeText={setTempDescription}
                                placeholder="Description détaillée de l'annonce..."
                                placeholderTextColor={theme.colors.textSecondary}
                                autoFocus
                            />
                            <View style={styles.modalButtons}>
                                <CustomButton
                                    title="Annuler"
                                    onPress={() => setDescriptionModalVisible(false)}
                                    style={[styles.modalButton, { marginRight: 10 }]}
                                    variant="secondary"
                                />
                                <CustomButton
                                    title="Sauvegarder"
                                    onPress={() => {
                                        setDescription(tempDescription);
                                        setDescriptionModalVisible(false);
                                    }}
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </GestureHandlerRootView>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: { padding: 16 },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: { marginTop: 16, fontSize: 16, textAlign: 'center' },
    guestContainer: { flex: 1, justifyContent: 'center', padding: 16 },

    // ✅ Styles pour les titres
    title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },

    // ✅ Nouveaux styles pour Image Uploader (pour le titre)
    imageUploaderContainer: { marginBottom: 20 },
    imageUploaderTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    // ✅ Nouveaux styles pour les catégories
    categoryContainer: {
        marginBottom: 20,
    },
    categoryInstruction: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center', // Centré comme demandé
        fontStyle: 'italic',
    },

    // ✅ STYLES PRIX/DEVISE
    priceCurrencyWrapper: {
        flexDirection: 'column',
        gap: 8,
        marginBottom: 20,
    },
    priceInput: {
        marginBottom: 0,
    },
    currencySelect: {
        marginBottom: 0,
        // Suppression de la hauteur fixe qui "rongeait" le champ
    },
    // FIN STYLES PRIX/DEVISE

    textArea: {
        height: 195,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    button: { marginTop: 24 },
    modalContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalTextInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
    }
});