import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AlertProvider } from '../components/AlertProvider';
import { AlertModal } from '../components/AlertModal';
import { ToastProvider } from '../components/ToastNotification';

const RootBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {children}
        </View>
    );
};

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
