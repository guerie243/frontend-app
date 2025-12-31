// App.js
// Important: doit être importé avant tout autre import lié aux gestures/navigation
import 'react-native-gesture-handler';
import React from 'react';
// ✅ Import du composant de gestuelle
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import { RootNavigator } from '../src/navigation/RootNavigator';

export default function App() {
    return (
        // ✅ CORRECTION APPLIQUÉE : Enveloppement de toute l'application
        // Note: Le style 'flex: 1' est crucial pour s'assurer qu'il prend tout l'espace.
        <GestureHandlerRootView style={{ flex: 1 }}> 
            <RootNavigator />
        </GestureHandlerRootView>
    );
}