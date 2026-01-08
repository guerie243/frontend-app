import React, { useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AlertProvider } from '../components/AlertProvider';
import { AlertModal } from '../components/AlertModal';
import { ToastProvider } from '../components/ToastNotification';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';

// Pre-load the logo asset
const LOGO_ASSET = require('../assets/images/logo_andy.png');

const RootBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {children}
        </View>
    );
};

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // Pre-fetch the logo to ensure it's ready for the StartupSplash
        // Note: use required asset to ensure it's bundled
        Asset.loadAsync(LOGO_ASSET).catch(err => console.log('Asset load fail:', err));
        Image.prefetch(LOGO_ASSET);
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AlertProvider>
                    <ToastProvider>
                        <RootBackground>
                            <AuthProvider>
                                {children}
                                <StatusBar style="auto" />
                            </AuthProvider>
                        </RootBackground>
                        <AlertModal />
                    </ToastProvider>
                </AlertProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};
