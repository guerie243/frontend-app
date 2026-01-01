import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';
import { lightColors, darkColors, typography, spacing, borderRadius } from '../config/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: {
        colors: typeof darkColors;
        typography: typeof typography;
        spacing: typeof spacing;
        borderRadius: typeof borderRadius;
        dark: boolean;
    };
    themeType: ThemeType;
    toggleTheme: () => void;
    setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
// Importation des dépendances (React, React Native, SecureStore) et des configurations de thème.
// Définition des types (`ThemeType`, `ThemeContextType`) et création du `ThemeContext`.

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>('dark');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await storage.getItem('appTheme');
                if (storedTheme === 'light' || storedTheme === 'dark') {
                    setThemeType(storedTheme);
                } else if (systemScheme) {

                }
            } catch (error) {
                console.error('Failed to load theme', error);
            }
        };
        loadTheme();
    }, [systemScheme]);
    // Définition du composant `ThemeProvider`. Initialisation de l'état du thème à 'dark'.
    // `useEffect` au montage : Tente de charger le thème stocké depuis SecureStore pour assurer la persistance.

    const toggleTheme = async () => {
        const newTheme = themeType === 'dark' ? 'light' : 'dark';
        setThemeType(newTheme);
        await storage.setItem('appTheme', newTheme);
    };
    // Fonction `toggleTheme` : Inverse le thème actuel ('light'/'dark'), met à jour l'état et stocke la nouvelle préférence.

    const setTheme = async (type: ThemeType) => {
        setThemeType(type);
        await storage.setItem('appTheme', type);
    };
    // Fonction `setTheme` : Définit explicitement le type de thème, met à jour l'état et stocke la préférence.

    const theme = {
        colors: themeType === 'dark' ? darkColors : lightColors,
        typography,
        spacing,
        borderRadius,
        dark: themeType === 'dark',
    };
    // Construction de l'objet `theme` final, sélectionnant les couleurs appropriées basées sur `themeType`.

    return (
        <ThemeContext.Provider value={{ theme, themeType, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
// Le `ThemeProvider` fournit l'objet `theme`, le type de thème et les fonctions de gestion via le contexte.

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
// Hook personnalisé `useTheme` : Permet aux composants d'accéder aux valeurs du contexte de thème.