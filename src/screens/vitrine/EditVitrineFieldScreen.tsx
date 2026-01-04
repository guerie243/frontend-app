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

    // Ajustement du libellé pour le slug
    const displayLabel = field === 'slug' ? "Nom d'utilisateur" : label;

    const [value, setValue] = useState(currentValue || '');
    const [isLoading, setIsLoading] = useState(false);
    const [liveError, setLiveError] = useState<string | null>(null);

    // --- LOGIQUE SPÉCIFIQUE TÉLÉPHONE ---
    const initialCountryCode = useMemo(() => {
        if (field === 'phone' && currentValue) {
            // Tente d'extraire le code pays (1 à 3 chiffres)
            const match = currentValue.match(/^\+?(\d{1,3})/);
            return match ? match[1] : '243';
        }
        return '243';
    }, [field, currentValue]);

    const initialLocalNumber = useMemo(() => {
        if (field === 'phone' && currentValue) {
            const countryCode = initialCountryCode;
            // On enlève le + initial s'il existe, puis le code pays au DEBUT seulement
            const cleanValue = currentValue.replace(/^\+/, '');
            if (cleanValue.startsWith(countryCode)) {
                return cleanValue.slice(countryCode.length);
            }
            return cleanValue;
        }
        return currentValue || '';
    }, [field, currentValue, initialCountryCode]);

    const [countryCode, setCountryCode] = useState(initialCountryCode);
    const [localNumber, setLocalNumber] = useState(initialLocalNumber);

    // --- LOGIQUE VALIDATION SLUG (Username) ---
    const validateSlug = (text: string) => {
        if (!text) return null;
        if (!text.startsWith('@')) return "Le nom d'utilisateur doit commencer par '@'";
        const content = text.slice(1);
        if (/[A-Z]/.test(content)) return "Les majuscules ne sont pas autorisées.";
        if (/\s/.test(content)) return "Les espaces ne sont pas autorisés.";
        if (/[^a-z0-9_]/.test(content)) return "Seuls les lettres minuscules, chiffres et tirets bas (_) sont autorisés.";
        return null;
    };

    const handleValueChange = (text: string) => {
        setValue(text);
        if (field === 'slug') {
            const error = validateSlug(text);
            setLiveError(error);
        }
    };

    const handleSave = async () => {
        console.log("1. [EditField] Tentative de PATCH pour le champ:", field);

        let finalValue = field === 'phone' ? ("+" + countryCode.replace(/^\+/, '') + localNumber.trim()) : value.trim();

        if (!finalValue && field !== 'description') {
            showError(`Le champ ${displayLabel} ne peut pas être vide`);
            return;
        }

        // --- VALIDATION SLUG (Username) ---
        if (field === 'slug') {
            const error = validateSlug(finalValue);
            if (error) {
                showError(error);
                return;
            }
            if (finalValue.length < 3) {
                showError("Le nom d'utilisateur est trop court.");
                return;
            }
        }

        setIsLoading(true);
        try {
            // Cas spécial pour les champs imbriqués dans contact
            if (field === 'phone') {
                console.log("2. [EditField] Envoi PATCH pour phone:", finalValue);
                await updateVitrine(slug, { contact: { phone: finalValue } });
            } else if (field === 'email') {
                console.log("2. [EditField] Envoi PATCH pour email:", finalValue);
                await updateVitrine(slug, { contact: { email: finalValue } });
            } else {
                console.log("2. [EditField] Envoi PATCH pour", field, ":", finalValue);
                const updates = { [field]: finalValue };
                await updateVitrine(slug, updates);
            }

            console.log("3. [EditField] ✅ PATCH réussi");

            const refreshTimestamp = Date.now();
            navigation.navigate('VitrineModificationMain', { refreshed: refreshTimestamp });

        } catch (error: any) {
            console.error("❌ [EditField] Erreur lors de la sauvegarde:", error);
            showError(error.message || 'Impossible de mettre à jour le champ');
        } finally {
            setIsLoading(false);
        }
    };

    // LOGIQUE DE MODIFICATION SPÉCIFIQUE AU SÉLECTEUR DE CATÉGORIE
    const categoriesForSelect: SelectOption[] = useMemo(() => {
        const GeneralOption: SelectOption = {
            slug: 'general',
            name: 'Générale',
            imageUri: null,
        };

        const filteredCategories = CATEGORIES_VITRINE.filter(cat => cat.slug !== 'all');

        return [GeneralOption, ...filteredCategories] as SelectOption[];
    }, []);

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Modifier {displayLabel}</Text>

                {field === 'category' ? (
                    <SimpleSelect
                        label={displayLabel}
                        options={categoriesForSelect}
                        value={value}
                        onChange={setValue}
                    />
                ) : field === 'phone' ? (
                    <View style={styles.phoneContainer}>
                        <View style={styles.countryCodeColumn}>
                            <CustomInput
                                label="Pays"
                                value={countryCode.replace(/^\+/, '')}
                                onChangeText={(text) => setCountryCode(text.replace(/[^0-9]/g, '').slice(0, 3))}
                                keyboardType="phone-pad"
                                maxLength={3}
                                containerStyle={{ marginBottom: 0 }}
                                LeftComponent={
                                    <Text style={{
                                        color: theme.colors.textSecondary,
                                        fontSize: 16,
                                        marginRight: 4,
                                        fontWeight: '600'
                                    }}>+</Text>
                                }
                            />
                        </View>
                        <View style={styles.localNumberColumn}>
                            <CustomInput
                                label="Numéro"
                                value={localNumber}
                                onChangeText={setLocalNumber}
                                placeholder="97709XXXX"
                                keyboardType="phone-pad"
                                containerStyle={{ marginBottom: 0 }}
                                autoFocus
                            />
                        </View>
                    </View>
                ) : (
                    <CustomInput
                        label={displayLabel}
                        value={value}
                        onChangeText={handleValueChange}
                        multiline={multiline}
                        numberOfLines={multiline ? 10 : 1}
                        keyboardType={keyboardType || 'default'}
                        autoFocus
                        placeholder={field === 'slug' ? "@nom_utilisateur" : ""}
                        style={multiline ? styles.textArea : {}}
                        error={liveError || undefined}
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
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    countryCodeColumn: {
        flex: 1,
        marginRight: 8,
    },
    localNumberColumn: {
        flex: 3,
    },
});