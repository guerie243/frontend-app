import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, ToastAndroid } from 'react-native';

export const copyToClipboard = async (text: string, successMessage: string = 'Lien copié !') => {
// Importation des dépendances : `Clipboard` (pour copier), 
// `Alert` et `ToastAndroid` (pour la notification de succès), et `Platform` (pour la détection de l'OS).
// Définition de la fonction asynchrone `copyToClipboard` qui prend un texte et un message de succès (par défaut 'Lien copié !').
// Note : Le message de succès par défaut a été traduit.

    await Clipboard.setStringAsync(text);
    // Copie le texte fourni dans le presse-papiers du système d'exploitation.

    if (Platform.OS === 'android') {
        ToastAndroid.show(successMessage, ToastAndroid.SHORT);
    } else {
        Alert.alert('Succès', successMessage);
        // Message traduit : 'Succès'
    }
};
// Bloc de gestion de la notification de succès : 
// Utilise `ToastAndroid` (notification non bloquante) pour Android, 
// et `Alert.alert` (boîte de dialogue bloquante) pour les autres plateformes (iOS, Web).