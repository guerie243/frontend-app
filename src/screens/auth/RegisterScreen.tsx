import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
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

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { login } = useAuth();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // États du formulaire
    const [profileName, setProfileName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useEmailForLogin, setUseEmailForLogin] = useState(false);

    // États visibilité
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    // Fonction de validation des mots de passe
    const passwordsMatch = password === confirmPassword;

    const handleRegister = async () => {
        if (!profileName || !password || !confirmPassword) {
            Alert.alert('Attention', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (useEmailForLogin && !email) {
            Alert.alert('Attention', 'Veuillez saisir votre adresse e-mail.');
            return;
        }
        if (!useEmailForLogin && !phoneNumber) {
            Alert.alert('Attention', 'Veuillez saisir votre numéro de téléphone.');
            return;
        }
        if (!passwordsMatch) {
            Alert.alert('Attention', 'Le mot de passe et sa confirmation ne correspondent pas.');
            return;
        }

        setIsLoading(true);

        try {
            const registrationData = {
                profileName,
                email: useEmailForLogin ? email : '',
                password,
                phoneNumber: useEmailForLogin ? '' : phoneNumber,
            };

            const registerResponse = await api.post('/users/', registrationData);

            if (registerResponse.status === 201) {
                const { token, user } = registerResponse.data;
                console.log('Registration success, logging in...');
                await login(token, user);
                console.log('Logged in, showing success alert...');
                Alert.alert('Succès', 'Inscription réussie !');
                console.log('Resetting navigation to MainTabs...');
                setProfileName('');
                setEmail('');
                setPhoneNumber('');
                setPassword('');
                setConfirmPassword('');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            } else {
                Alert.alert('Échec', 'Impossible de créer votre compte.');
            }
        } catch (error: any) {
            Alert.alert('Oups !', error.response?.data?.message || 'Une erreur inattendue est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
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
                            <Text style={[styles.title, { color: theme.colors.text }]}>Créer un Compte</Text>
                            <Text style={styles.subtitle}>Rejoignez-nous aujord&apos;hui !</Text>

                            <View style={styles.form}>
                                <CustomInput
                                    placeholder="Nom Complet"
                                    value={profileName}
                                    onChangeText={setProfileName}
                                />

                                {useEmailForLogin ? (
                                    <CustomInput
                                        placeholder="Adresse E-mail"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                ) : (
                                    <CustomInput
                                        placeholder="Numéro de Téléphone"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                    />
                                )}

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

                                <CustomInput
                                    placeholder="Confirmer le Mot de Passe"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    style={!passwordsMatch && confirmPassword ? styles.inputError : {}}
                                    RightComponent={
                                        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={{ padding: 8 }}>
                                            <Ionicons
                                                name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                                                size={20}
                                                color={theme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    }
                                />

                                {!passwordsMatch && confirmPassword.length > 0 && (
                                    <Text style={styles.errorMessage}>
                                        Les mots de passe ne correspondent pas.
                                    </Text>
                                )}

                                <TouchableOpacity
                                    onPress={() => setUseEmailForLogin(prev => !prev)}
                                    style={styles.toggleContainer}
                                >
                                    <Text style={styles.toggleText}>
                                        {useEmailForLogin
                                            ? "S'inscrire avec un Numéro de Téléphone"
                                            : "S'inscrire avec une Adresse E-mail"}
                                    </Text>
                                </TouchableOpacity>

                                <CustomButton
                                    title="S'inscrire"
                                    onPress={handleRegister}
                                    isLoading={isLoading}
                                    style={[styles.registerButton, { backgroundColor: theme.colors.primary }]}
                                />

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Déjà un compte ? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.link}>Se Connecter</Text>
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
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.l,
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
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
    registerButton: {
        marginTop: theme.spacing.m,
    },
    toggleContainer: {
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
    },
    toggleText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    inputError: {
        borderColor: theme.colors.danger,
        borderWidth: 1,
    },
    errorMessage: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
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