import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { VitrineDetailScreen } from '../screens/vitrine/VitrineDetailScreen';
import { CreateAnnonceScreen } from '../screens/annonce/CreateAnnonceScreen';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const AppTabs = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarIcon: ({ focused, color, size }) => {
                    // Custom design for 'CreateAnnonce' (Central Button)
                    if (route.name === 'CreateAnnonce') {
                        return (
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: theme.colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                top: -15, // Lift the button up
                                ...theme.shadows.medium,
                            }}>
                                <Ionicons name="add" size={32} color={theme.colors.white} />
                            </View>
                        );
                    }

                    let iconName: any;

                    if (route.name === 'Accueil') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Vitrine') {
                        iconName = focused ? 'storefront' : 'storefront-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Accueil" component={HomeScreen} />
            <Tab.Screen
                name="CreateAnnonce"
                component={CreateAnnonceScreen}
                options={{
                    title: 'Publier',
                    tabBarLabel: 'Publier',
                }}
            />
            <Tab.Screen
                name="Vitrine"
                component={VitrineDetailScreen}
                options={{
                    title: 'Ma Vitrine',
                    tabBarLabel: 'Ma Vitrine'
                }}
            />
        </Tab.Navigator>
    );
};
// Ce fichier définit la navigation par onglets principale de l'application.
// Onglets : Accueil, Publier (Bouton central proéminent), Vitrines.
// L'écran Paramètres a été retiré de la barre d'onglets principale.