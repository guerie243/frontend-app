/**
 * AppStack - Navigation Principale avec Écrans d'Authentification
 * 
 * ARCHITECTURE REFACTORISÉE : Guest-Usable
 * 
 * Ce stack contient TOUS les écrans de l'application, y compris Login et Register,
 * pour permettre aux invités d'y accéder depuis n'importe où dans l'app.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VitrinesListScreen } from '../screens/vitrine/VitrinesListScreen';
import { CreateEditVitrineScreen } from '../screens/vitrine/CreateEditVitrineScreen';
import { VitrineDetailScreen } from '../screens/vitrine/VitrineDetailScreen'; // NEW (Unified)
// import { VitrinePublicScreen } from '../screens/vitrine/VitrinePublicScreen'; // REMOVED
// import { VitrineManagementScreen } from '../screens/vitrine/VitrineManagementScreen'; // REMOVED
import { VitrineListScreen } from '../screens/vitrine/VitrineListScreen'; // NEW (Public List)
import { VitrineModificationMain } from '../screens/vitrine/VitrineModificationMain';
import { EditVitrineFieldScreen } from '../screens/vitrine/EditVitrineFieldScreen';
import { AnnonceModificationMain } from '../screens/annonce/AnnonceModificationMain';
import { CreateAnnonceScreen } from '../screens/annonce/CreateAnnonceScreen';
import { AnnonceDetailScreen } from '../screens/annonce/AnnonceDetailScreen';
import { EditAnnonceFieldScreen } from '../screens/annonce/EditAnnonceFieldScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { ProfileDetailScreen } from '../screens/settings/ProfileDetailScreen';
import { CompteModificationMain } from '../screens/settings/CompteModificationMain';
import { EditCompteFieldScreen } from '../screens/settings/EditCompteFieldScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { PrivacyPolicyScreen } from '../screens/settings/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/settings/TermsOfServiceScreen';
import { LinkingHandler } from './LinkingHandler';

const Stack = createNativeStackNavigator();

export const AppStack = () => {
    return (
        <>
            <LinkingHandler />
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {/* Écran principal avec tabs */}
                <Stack.Screen name="MainTabs" component={AppTabs} />

                {/* Auth Routes - Accessibles en mode invité */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />

                {/* Vitrine Routes */}
                <Stack.Screen name="VitrinesList" component={VitrinesListScreen} />
                <Stack.Screen name="CreateEditVitrine" component={CreateEditVitrineScreen} />
                <Stack.Screen name="VitrineDetail" component={VitrineDetailScreen} />
                {/* <Stack.Screen name="VitrineManagement" component={VitrineManagementScreen} />  Obsolete */}
                <Stack.Screen name="VitrineList" component={VitrineListScreen} />
                <Stack.Screen name="VitrineModificationMain" component={VitrineModificationMain} />
                <Stack.Screen name="EditVitrineField" component={EditVitrineFieldScreen} />

                {/* Annonce Routes */}
                <Stack.Screen name="CreateEditAnnonce" component={AnnonceModificationMain} />
                <Stack.Screen name="AnnonceModificationMain" component={AnnonceModificationMain} />
                <Stack.Screen name="CreateAnnonce" component={CreateAnnonceScreen} />
                <Stack.Screen name="AnnonceDetail" component={AnnonceDetailScreen} />
                <Stack.Screen name="EditAnnonceField" component={EditAnnonceFieldScreen} />

                {/* Settings Routes */}
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
                <Stack.Screen name="CompteModificationMain" component={CompteModificationMain} />
                <Stack.Screen name="EditCompteField" component={EditCompteFieldScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            </Stack.Navigator>
        </>
    );
};
// Ce fichier définit le stack de navigation principal de l'application,
// incluant tous les écrans tels que l'authentification, la gestion des vitrines et annonces,
// ainsi que les paramètres utilisateur. Cela permet aux utilisateurs invités
// d'accéder aux écrans de connexion et d'inscription depuis n'importe où dans l'application.