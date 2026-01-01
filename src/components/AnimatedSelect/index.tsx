import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, Platform, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { CustomInput } from "../CustomInput";

// --- Interfaces de Données ---

export interface SelectOption {
    name: string;
    slug: string;
    imageUri: string | null;
}

export type CascadingChildOption = SelectOption;

export interface CascadingParentOption extends SelectOption {
    children: CascadingChildOption[];
}

// --- Composant 1 : SimpleSelect ---

interface SimpleSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (val: string) => void;
    label?: string;
    error?: string;
    style?: any;
    inputWrapperStyle?: any;
    inputStyle?: any;
    onToggleOpen?: (isOpen: boolean) => void;
    zIndex?: number;
    disabled?: boolean;
}

export const SimpleSelect: React.FC<SimpleSelectProps> = ({
    options,
    value,
    onChange,
    label,
    error,
    style,
    inputWrapperStyle,
    inputStyle,
    onToggleOpen,
    zIndex = 10,
    disabled = false,
}) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const selectedOption = useMemo(() => {
        if (!options || options.length === 0) return null;
        return options.find(opt => opt && opt.slug === value);
    }, [options, value]);

    useEffect(() => {
        Animated.timing(animation, {
            toValue: openDropdown ? 1 : 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [openDropdown, animation]);

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    const handlePress = () => {
        if (!disabled) {
            const nextState = !openDropdown;
            if (onToggleOpen) onToggleOpen(nextState);
            setOpenDropdown(nextState);
        }
    };

    const listSections = useMemo(() => [{ title: '', data: options || [] }], [options]);

    const renderSimpleOption = ({ item }: { item: SelectOption }) => (
        <Pressable
            key={item.slug}
            style={({ pressed }) => [
                styles.option,
                {
                    backgroundColor: item.slug === value ? '#eef' : pressed ? '#f5f5f5' : '#fff'
                }
            ]}
            onPress={() => {
                onChange(item.slug);
                setOpenDropdown(false);
            }}
        >
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.optionImage} />}
            <Text style={styles.optionText}>{item.name}</Text>
        </Pressable>
    );

    return (
        // 🛑 CORRECTION 1.3 : Z-Index dynamique et position relative forcée pour le contexte
        <View style={[styles.container, style, {
            zIndex: openDropdown ? 9999 : (zIndex || 10),
            position: 'relative',
            overflow: 'visible',
        }]}>
            <CustomInput
                label={label}
                error={error}
                editable={false}
                inputWrapperStyle={inputWrapperStyle}
                // ⭐ RETRAIT style={[style, inputStyle]} - style ne doit pas être appliqué au TextInput interne de CustomInput.
                style={inputStyle}
                onPressIn={handlePress}
            >
                {/* Le View des children dans CustomInput a désormais height: 100% et alignItems: 'center'.
                   Il suffit de s'assurer que ce selectedValueWrapper prend aussi 100% de la hauteur disponible.
                */}
                {selectedOption ? (
                    <View style={styles.selectedValueWrapper}>
                        {selectedOption.imageUri && (
                            <Image source={{ uri: selectedOption.imageUri }} style={styles.selectedImage} />
                        )}
                        <Text style={[styles.selectedValueText, inputStyle]}>{selectedOption.name}</Text>
                    </View>
                ) : (
                    <Text style={[styles.selectedValueText, { color: '#888' }]}>Sélectionner...</Text>
                )}
                <Animated.Text style={[styles.dropdownIcon, { transform: [{ rotate: rotateIcon }] }]}>
                    ▼
                </Animated.Text>
            </CustomInput>

            {openDropdown && (
                <View style={styles.dropdownContainer}>
                    <SectionList
                        sections={listSections}
                        keyExtractor={(item, index) => item.slug || `simple-no-slug-${index}`}
                        style={styles.dropdownScrollView}
                        renderItem={renderSimpleOption}
                        renderSectionHeader={() => null}
                        initialNumToRender={10}
                    />
                </View>
            )}
        </View>
    );
};


// --- Composant 2 : CascadingSelects ---

interface CascadingSelectsProps {
    parentOptions: CascadingParentOption[];
    parentValue: string | null;
    childValue: string | null;
    onParentChange: (slug: string) => void;
    onChildChange: (slug: string | null) => void;
    parentLabel: string;
    childLabel: string;
    parentError?: string;
    childError?: string;
    onToggleOpen?: (isOpen: boolean) => void;
    disabled?: boolean;
}

export const CascadingSelects: React.FC<CascadingSelectsProps> = ({
    parentOptions,
    parentValue,
    childValue,
    onParentChange,
    onChildChange,
    parentLabel,
    childLabel,
    parentError,
    childError,
    onToggleOpen,
    disabled = false,
}) => {

    const selectedParent = useMemo(() => {
        return parentOptions.find(opt => opt.slug === parentValue) || null;
    }, [parentOptions, parentValue]);

    const childOptions = useMemo(() => {
        return selectedParent ? selectedParent.children : [];
    }, [selectedParent]);

    const handleParentChange = (newParentSlug: string) => {
        onParentChange(newParentSlug);
        onChildChange(null);
    };

    return (
        <View>
            {/* --- Sélecteur Parent (Z-Index plus haut pour passer au-dessus de l'enfant) --- */}
            <SimpleSelect
                label={parentLabel}
                error={parentError}
                options={parentOptions}
                value={parentValue}
                onChange={handleParentChange}
                zIndex={20}
                onToggleOpen={onToggleOpen}
                disabled={disabled}
            />

            {/* --- Sélecteur Enfant (Affiché seulement si un parent est sélectionné) --- */}
            {parentValue ? (
                <SimpleSelect
                    label={childLabel}
                    error={childError}
                    options={childOptions}
                    value={childValue}
                    onChange={onChildChange}
                    inputWrapperStyle={{ marginTop: 20 }}
                    zIndex={10}
                    onToggleOpen={onToggleOpen}
                    disabled={disabled}
                />
            ) : (
                <Text style={styles.childPlaceholderText}>
                    Sélectionnez d'abord {parentLabel.toLowerCase()} de votre annonce pour voir les types.
                </Text>
            )}

            {parentValue && childOptions.length === 0 ? (
                <Text style={styles.noOptionsText}>Aucune option disponible dans cette sélection.</Text>
            ) : null}

        </View>
    );
};


// --- Styles (Mis à jour) ---

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
        marginBottom: 20,
    },
    selectedValueWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        // ⭐ CORRECTION CLÉ: Assure que la zone de texte sélectionnée remplit la hauteur.
        height: '100%',
    },
    dropdownIcon: {
        fontSize: 18,
        color: '#333',
        marginLeft: 'auto',
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60,
        zIndex: 10000, // Supérieur au conteneur
        width: '100%',
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        maxHeight: 250,
        overflow: 'hidden',
        // Ombre plus prononcée pour aider visuellement sur le web
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },

    dropdownScrollView: {
        flex: 1,
    },

    // Nouveaux styles pour CascadingSelects
    childPlaceholderText: {
        marginTop: 20,
        paddingHorizontal: 5,
        color: '#888',
        fontStyle: 'italic',
        fontSize: 14,
    },
    noOptionsText: {
        marginTop: 10,
        paddingHorizontal: 5,
        color: 'red',
        fontSize: 14,
    },

    // Styles des options
    option: {
        height: 40,
        flexDirection: 'row',
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#f0f0f0',
    },
    optionImage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    optionText: {
        fontSize: 15,
        color: "#333",
    },
    selectedImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    selectedValueText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        // ⭐ AJOUT: Assure le centrage vertical dans la hauteur disponible
        textAlignVertical: 'center',
    }
});