import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LoadingComponent } from '../../components/LoadingComponent';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login } = useAuth();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // L'identifiant (username, email ou phone) est stocké dans cette variable
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // État pour gérer le mode de connexion: 0: Username (Défaut), 1: Email, 2: Phone Number
    const [loginMode, setLoginMode] = useState(0);

    // Fonction pour déterminer le placeholder basé sur le mode
    const getPlaceholder = () => {
        switch (loginMode) {
            case 1:
                return "Adresse E-mail";
            case 2:
                return "Numéro de Téléphone";
            case 0:
            default:
                return "Nom d'utilisateur";
        }
    };

    // Fonction de bascule pour passer au mode suivant (0 -> 1 -> 2 -> 0)
    const toggleLoginMode = () => {
        setIdentifier('');
        setLoginMode((prevMode) => (prevMode + 1) % 3);
    };


    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('', 'Veuillez fournir vos identifiants et mot de passe.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Attempting login with:', identifier);
            const response = await api.post('/users/login', { identifier, password });

            if (response.status === 200) {
                await login(response.data.token, response.data.user);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            } else {
                Alert.alert('Échec', response.data.message || 'Identifiants invalides');
            }
        } catch (error: any) {
            console.error('Login Error:', error);
            const message = error.response?.data?.message || error.message || 'Une erreur inattendue est survenue.';
            Alert.alert('Erreur de Connexion', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isLoading ? (
                <LoadingComponent />
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Bienvenue</Text>
                            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

                            <View style={styles.form}>
                                <CustomInput
                                    placeholder={getPlaceholder()}
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    keyboardType={loginMode === 1 ? 'email-address' : (loginMode === 2 ? 'phone-pad' : 'default')}
                                    autoCapitalize={loginMode === 1 ? 'none' : 'words'}
                                />

                                <CustomInput
                                    placeholder="Mot de Passe"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    RightComponent={
                                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 8 }}>
                                            <Ionicons
                                                name={isPasswordVisible ? 'eye-off' : 'eye'}
                                                size={20}
                                                color={theme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    }
                                />

                                <TouchableOpacity
                                    onPress={toggleLoginMode}
                                    style={styles.toggleContainer}
                                >
                                    <Text style={styles.toggleText}>
                                        Changer le mode de connexion
                                    </Text>
                                </TouchableOpacity>

                                <CustomButton
                                    title="Se Connecter"
                                    onPress={handleLogin}
                                    isLoading={false}
                                    style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                                />

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Pas de compte ? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={styles.link}>S&apos;inscrire</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </ScreenWrapper>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.l,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        // flex: 1, // Removed to allow ScrollView to handle height
        justifyContent: 'center',
        paddingVertical: 20
    },
    title: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: theme.spacing.l,
    },
    toggleContainer: {
        alignSelf: 'flex-start',
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
    },
    toggleText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.l,
    },
    footerText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    link: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});