import React from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Politique de Confidentialité</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Collecte des Données</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Nous collectons les informations que vous nous fournissez directement, notamment lors de la création de votre compte, de votre vitrine ou de vos annonces. Cela peut inclure votre nom, adresse e-mail, numéro de téléphone et photographies.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Utilisation des Données</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Vos données sont utilisées pour fournir, maintenir et améliorer nos services, notamment pour faciliter la mise en relation entre vendeurs et acheteurs, et pour assurer la sécurité de notre plateforme.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Partage des Informations</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Les informations de votre vitrine et vos annonces sont publiques et accessibles à tous les utilisateurs de l'application. Nous ne vendons pas vos informations personnelles à des tiers.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Sécurité</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès, modification ou destruction non autorisé.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Vos Droits</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Vous pouvez à tout moment accéder à vos informations, les modifier ou supprimer votre compte depuis les paramètres de l'application.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'justify',
    },
});
