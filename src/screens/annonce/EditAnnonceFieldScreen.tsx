/**
 * EditAnnonceFieldScreen - Permet l'édition d'un champ unique d'une annonce.
 * Logique basée sur EditVitrineFieldScreen.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, TextInput, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAnnonces } from '../../hooks/useAnnonces';

// 💡 CHANGEMENT 1 : Importation de CascadingSelects et des nouvelles interfaces
import { CascadingSelects, CascadingParentOption, SimpleSelect } from '../../components/AnimatedSelect';

// 💡 IMPORTATION DE LA NOUVELLE CONSTANTE FORMATÉE et chemin ajusté
import { ANNONCE_CATEGORIES_FORMATTED } from '../../Data/annoncetypes';
import { CURRENCY_OPTIONS } from '../../Data/currencies';

// Définition du type de la constante pour la démo (le format SelectSection que vous utilisiez)
interface RawCategorySection {
    title: string;
    slug: string;
    data: { name: string; slug: string; imageUri: string | null; }[];
}

export const EditAnnonceFieldScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const { updateAnnonce } = useAnnonces();

    // currentValue est la sous-catégorie (slug) si field === 'category'
    const { field, label, currentValue, annonceSlug, vitrineSlug, multiline, keyboardType } = route.params;

    // 💡 CHANGEMENT 2 : Si le champ n'est PAS 'category', nous utilisons le useState simple.
    const [value, setValue] = useState(field !== 'category' ? (currentValue || '') : '');

    // 💡 CHANGEMENT 3 : États pour les sélecteurs en cascade
    const [parentCategorySlug, setParentCategorySlug] = useState<string | null>(null);
    const [childCategorySlug, setChildCategorySlug] = useState<string | null>(field === 'category' ? (currentValue || null) : null);

    const [isLoading, setIsLoading] = useState(false);
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    // 💡 Changement 4 : Préparation des données au format CascadingSelects
    const cascadingCategories: CascadingParentOption[] = useMemo(() => {
        const rawCategories = (ANNONCE_CATEGORIES_FORMATTED || []) as RawCategorySection[];

        return rawCategories.map(section => ({
            name: section.title,
            slug: section.slug,
            imageUri: null,
            children: section.data.map(item => ({
                name: item.name,
                slug: item.slug,
                imageUri: item.imageUri,
            })),
        }));
    }, []);

    // 💡 Changement 5 : Détermination du parent initial
    // Exécuté une seule fois pour initialiser le sélecteur parent
    useMemo(() => {
        if (field === 'category' && childCategorySlug) {
            // Cherche la section qui contient la sous-catégorie actuelle (childCategorySlug)
            const parentSection = cascadingCategories.find(parent =>
                parent.children.some(child => child.slug === childCategorySlug)
            );

            if (parentSection) {
                setParentCategorySlug(parentSection.slug);
            }
        }
    }, [field, childCategorySlug, cascadingCategories]);


    const handleSave = async () => {
        // La valeur à sauvegarder dépend du champ
        const finalValue = field === 'category' ? childCategorySlug : value.toString().trim();

        if (!finalValue) {
            Alert.alert('Erreur', field === 'category' ? 'Veuillez sélectionner une sous-catégorie' : 'Le champ ne peut pas être vide');
            return;
        }

        if (field === 'price' && isNaN(parseFloat(finalValue))) {
            Alert.alert('Erreur', 'Le prix doit être un nombre valide.');
            return;
        }

        setIsLoading(true);
        try {
            // La catégorie est la sous-catégorie choisie
            const updates = {
                [field]: field === 'price' ? parseFloat(finalValue) : finalValue
            };

            await updateAnnonce(annonceSlug, updates);

            const refreshTimestamp = Date.now();
            // Utiliser navigate au lieu de replace pour éviter d'ajouter une nouvelle instance dans la stack
            navigation.navigate('AnnonceModificationMain', {
                annonceSlug,
                vitrineSlug,
                refreshed: refreshTimestamp
            });

        } catch (error: any) {
            console.error("❌ [EditAnnonceField] Erreur lors de la sauvegarde:", error);
            Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le champ');
        } finally {
            setIsLoading(false);
        }
    };

    // Rendu conditionnel du champ d'entrée
    const renderInputField = () => {
        if (field === 'category') {
            // 💡 UTILISATION DE CASCADINGSELECTS
            return (
                <CascadingSelects
                    parentLabel="Catégorie Principale"
                    childLabel={label} // Utilise le label dynamique de la route pour l'enfant (Sous-catégorie)

                    parentOptions={cascadingCategories}
                    parentValue={parentCategorySlug}
                    onParentChange={setParentCategorySlug} // Le composant interne réinitialise l'enfant

                    childValue={childCategorySlug}
                    onChildChange={setChildCategorySlug}
                />
            );
        } else if (field === 'currency') {
            return (
                <View style={{ zIndex: 100 }}>
                    <SimpleSelect
                        label="Devise"
                        options={CURRENCY_OPTIONS}
                        value={value.toString()}
                        onChange={(val) => setValue(val)}
                        zIndex={100}
                    />
                </View>
            );
        } else if (field === 'description') {
            return (
                <Pressable onPress={() => {
                    setTempDescription(value.toString());
                    setDescriptionModalVisible(true);
                }}>
                    <CustomInput
                        label={label}
                        value={value.toString()}
                        editable={false}
                        multiline
                        style={styles.textArea}
                        pointerEvents="none"
                    />
                </Pressable>
            );
        } else {
            // Utilise CustomInput pour tous les autres champs (inchangé)
            return (
                <CustomInput
                    label={label}
                    value={value.toString()}
                    onChangeText={setValue}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    keyboardType={keyboardType || 'default'}
                    autoFocus={field !== 'currency'} // Pas d'autofocus pour le select
                    style={multiline ? styles.textArea : {}}
                    editable={!isLoading}
                />
            );
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={[styles.title, { color: theme.colors.text }]}>Modifier {label}</Text>

                    {renderInputField()} {/* <-- Rendu conditionnel */}

                    <CustomButton
                        title="Enregistrer"
                        onPress={handleSave}
                        isLoading={isLoading}
                        style={styles.button}
                        // Désactiver le bouton si 'category' est le champ et qu'aucun enfant n'est sélectionné
                        disabled={field === 'category' && !childCategorySlug}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* MODAL pour la Description (Logique identique à CreateAnnonceScreen) */}
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
                                    style={{ ...styles.modalButton, marginRight: 10 }}
                                    variant="secondary"
                                />
                                <CustomButton
                                    title="Sauvegarder"
                                    onPress={() => {
                                        setValue(tempDescription);
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
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    button: {
        marginTop: 24,
    },
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
        marginBottom: 20,
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