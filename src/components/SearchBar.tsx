import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { CustomInput } from './CustomInput';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SearchBarProps {
    value?: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    containerStyle?: ViewStyle;
    onSearch?: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder = "Rechercher...",
    containerStyle,
    onSearch
}) => {
    const { theme } = useTheme();

    const handleSubmit = () => {
        if (onSearch && value && value.trim()) {
            onSearch(value.trim());
        }
    };

    return (
        <CustomInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            containerStyle={{ marginBottom: 0, ...containerStyle }}
            inputWrapperStyle={{
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.round,
                height: 48,
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            LeftComponent={
                <Feather
                    name="search"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={{ marginRight: 8 }}
                />
            }
        />
    );
};
