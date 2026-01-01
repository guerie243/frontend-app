import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Universal Storage Utility
 * Uses SecureStore on Native platforms (iOS/Android)
 * Falls back to localStorage on Web
 */
export const storage = {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.error('Error reading from localStorage', error);
                return null;
            }
        }
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error(`Error reading ${key} from SecureStore`, error);
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.error('Error writing to localStorage', error);
            }
            return;
        }
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`Error writing ${key} to SecureStore`, error);
        }
    },

    async deleteItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing from localStorage', error);
            }
            return;
        }
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error(`Error deleting ${key} from SecureStore`, error);
        }
    },
};
