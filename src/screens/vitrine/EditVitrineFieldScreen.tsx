import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useVitrines } from '../../hooks/useVitrines';
import { SimpleSelect, SelectOption } from '../../components/AnimatedSelect';
import { CATEGORIES_VITRINE } from '../../Data/vitrinecategorys';
import { useAlertService } from '../../utils/alertService';

// 1. DÉFINITION DES TYPES POUR LES PARAMÈTRES DE ROUTE
type VitrineParams = {
    VitrineModificationMain: { refreshed: number }; // Pour la navigation de retour
    EditVitrineField: {
        field: string;
        label: string;
        currentValue: string;
        slug: string;
        multiline?: boolean;
        keyboardType?: KeyboardTypeOptions;
    };
};
type EditVitrineFieldRouteProp = RouteProp<VitrineParams, 'EditVitrineField'>;

export const EditVitrineFieldScreen = () => {
    // Utilisation des types dans useNavigation et useRoute
    const navigation = useNavigation<any>(); // Peut être typé plus précisément
    const route = useRoute<EditVitrineFieldRouteProp>();

    const { theme } = useTheme();
    const { updateVitrine } = useVitrines();
    const { showError } = useAlertService();

    // 2. Les paramètres sont typés ici
    const { field, label, currentValue, slug, multiline, keyboardType } = route.params;

    const [value, setValue] = useState(currentValue || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        console.log("1. [EditField] Tentative de PATCH pour le champ:", field, "avec valeur:", value);

        const trimmedValue = value.trim();

        if (!trimmedValue && field !== 'description') { // Permet description vide si besoin
            showError(`Le champ ${label} ne peut pas être vide`);
            return;
        }

        // Validation spéciale pour le slogan
        if (field === 'slug') {
            if (!trimmedValue.startsWith('@') || trimmedValue.length <= 1) {
                showError('Le slogan doit commencer par "@" et contenir au moins un caractère');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Construction dynamique du payload
            const finalValue = trimmedValue;

            // Cas spécial pour les champs imbriqués dans contact
            if (field === 'phone') {
                console.log("2. [EditField] Envoi PATCH pour phone (nested in contact)");
                await updateVitrine(slug, { contact: { phone: finalValue } });
            } else if (field === 'email') {
                console.log("2. [EditField] Envoi PATCH pour email (nested in contact)");
                await updateVitrine(slug, { contact: { email: finalValue } });
            } else {
                console.log("2. [EditField] Envoi PATCH pour", field);
                const updates = { [field]: finalValue };
                await updateVitrine(slug, updates);
            }

            console.log("3. [EditField] ✅ PATCH réussi - Mise à jour en base de données confirmée");

            const refreshTimestamp = Date.now();
            console.log("4. [EditField] Navigation vers VitrineModificationMain avec refreshed:", refreshTimestamp);

            // 3. Navigation avec NAVIGATE pour éviter les boucles dans la stack (trouve l'instance existante)
            navigation.navigate('VitrineModificationMain', { refreshed: refreshTimestamp });

        } catch (error: any) { // Type 'any' pour l'erreur
            console.error("❌ [EditField] Erreur lors de la sauvegarde:", error);
            showError(error.message || 'Impossible de mettre à jour le champ');
        } finally {
            setIsLoading(false);
        }
    };

    // LOGIQUE DE MODIFICATION SPÉCIFIQUE AU SÉLECTEUR DE CATÉGORIE
    const categoriesForSelect: SelectOption[] = useMemo(() => {
        const GeneralOption: SelectOption = {
            slug: 'generale',
            name: 'Générale',
            imageUri: null,
        };

        const filteredCategories = CATEGORIES_VITRINE.filter(cat => cat.slug !== 'all');

        return [GeneralOption, ...filteredCategories] as SelectOption[];
    }, []); // Utilisation de useMemo pour optimiser

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Modifier {label}</Text>

                {field === 'category' ? (
                    <SimpleSelect
                        label={label}
                        options={categoriesForSelect}
                        value={value}
                        onChange={setValue}
                    />
                ) : (
                    <CustomInput
                        label={label}
                        value={value}
                        onChangeText={setValue}
                        multiline={multiline}
                        numberOfLines={multiline ? 10 : 1}
                        keyboardType={keyboardType || 'default'}
                        autoFocus
                        style={multiline ? styles.textArea : {}}
                    />
                )}

                <CustomButton
                    title="Enregistrer"
                    onPress={handleSave}
                    isLoading={isLoading}
                    style={styles.button}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    button: {
        marginTop: 24,
    },
    textArea: {
        minHeight: 350,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
});