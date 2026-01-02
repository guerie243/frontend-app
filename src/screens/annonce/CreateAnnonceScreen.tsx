/**
 * CreateAnnonceScreen - Création d'Annonce Simplifiée
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, TextInput, Pressable } from 'react-native';
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
import { useAlertService } from '../../utils/alertService';

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
    const { showError, showSuccess, showInfo, showConfirm } = useAlertService();

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

    const styles = useMemo(() => createStyles(theme), [theme]);

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
            return showConfirm(
                'Vous devez être connecté pour créer une annonce.',
                () => navigation.navigate('Login'),
                undefined,
                'Connexion requise',
                'Se connecter',
                'Annuler'
            );
        }

        if (!userVitrine) {
            const isVitrinesLoading = vitrines === null || vitrines === undefined;
            if (isVitrinesLoading) {
                return showInfo('Chargement de votre vitrine en cours...', 'Patientez');
            }
            return showConfirm(
                'Vous devez créer une vitrine avant de pouvoir publier une annonce.',
                () => navigation.navigate('CreateVitrine'),
                undefined,
                'Vitrine requise',
                'Créer ma Vitrine',
                'Annuler'
            );
        }

        // ❌ Validation: 2 à 5 photos obligatoires -> 1 minimum
        if (images.length < 1) {
            return showError('Veuillez ajouter au moins 1 image pour votre annonce.');
        }
        if (images.length > 5) {
            return showError('Vous ne pouvez pas ajouter plus de 5 images.');
        }

        // ✅ Validation: Le prix n'est plus obligatoire, mais le titre et la catégorie le sont.
        if (!title || !parentCategorySlug) {
            return showError('Le titre et la catégorie sont requis.');
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

            // Succès - Maintenant compatible web et mobile
            const resetForm = () => {
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
            };

            showSuccess('Annonce créée avec succès');
            // Petit délai pour que l'utilisateur voie l'alerte avant la navigation
            setTimeout(resetForm, 500);
        } catch (error: any) {
            console.error('Erreur création annonce:', error);
            showError(error.message || 'Impossible de créer l\'annonce');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormDisabled = isSelectOpen || isLoading;

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    scrollEnabled={!isLoading}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text style={styles.title}>
                        Ajouter votre annonce
                    </Text>
                    {userVitrine && (
                        <Text style={styles.subtitle}>
                            Vitrine: {userVitrine.name}
                        </Text>
                    )}

                    {/* 1. UPLOADER D'IMAGE (Déplacé en premier) */}
                    <View style={styles.imageUploaderContainer} pointerEvents={isSelectOpen ? 'none' : 'auto'}>
                        <Text style={styles.imageUploaderTitle}>
                            Photos (1 à 5 images)*
                        </Text>
                        <ImageUploader images={images} setImages={setImages} />
                    </View>

                    {/* 2. BLOC TITRE/INPUT - Désactivé si un selecteur est ouvert */}
                    <View style={styles.titleInputContainer} pointerEvents={isSelectOpen ? 'none' : 'auto'}>
                        <CustomInput
                            label="Titre du produit *"
                            placeholder="ex: T-Shirt Premium"
                            value={title}
                            onChangeText={setTitle}
                            editable={!isFormDisabled}
                        />
                    </View>

                    {/* 3. CASCADING SELECTS (Catégorie) - Gère son état isSelectOpen */}
                    <View style={styles.categoryContainer}>
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
                    <View style={styles.priceCurrencyWrapper}>
                        {/* 
                            On ne bloque pas le conteneur parent pour permettre l'interaction avec le SimpleSelect.
                            On bloque l'input de prix individuellement via pointerEvents si besoin, 
                            mais ici 'editable' suffit déjà pour CustomInput.
                         */}
                        <CustomInput
                            // Le prix est rendu optionnel ici
                            label="Prix"
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
                    <View style={styles.descriptionButtonContainer} pointerEvents={isSelectOpen ? 'none' : 'auto'}>

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
                        style={styles.modalKeyboardAvoiding}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Description du produit</Text>
                            <TextInput
                                style={styles.modalTextInput}
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

const createStyles = (theme: any) => StyleSheet.create({
    keyboardAvoidingView: { flex: 1 },
    content: {
        padding: 16,
        backgroundColor: theme.colors.background,
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
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    guestContainer: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },

    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },

    imageUploaderContainer: { marginBottom: 20, zIndex: 100 },
    imageUploaderTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: theme.colors.text,
    },

    titleInputContainer: { zIndex: 90 },

    categoryContainer: {
        marginBottom: 20,
        zIndex: 80,
    },
    categoryInstruction: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
    },

    priceCurrencyWrapper: {
        flexDirection: 'column',
        gap: 8,
        marginBottom: 20,
        zIndex: 70,
    },
    priceInput: {
        marginBottom: 0,
    },
    currencySelect: {
        marginBottom: 0,
    },

    descriptionButtonContainer: { zIndex: 60 },

    button: { marginTop: 24 },

    modalKeyboardAvoiding: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        backgroundColor: theme.colors.background,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: theme.colors.text,
    },
    modalTextInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        textAlignVertical: 'top',
        borderColor: theme.colors.border,
        color: theme.colors.text,
        backgroundColor: theme.colors.surface,
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
