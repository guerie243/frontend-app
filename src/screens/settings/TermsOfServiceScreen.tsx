import React from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const TermsOfServiceScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Conditions Générales d'Utilisation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Acceptation des Conditions</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    En accédant à cette application, vous acceptez d'être lié par les présentes conditions générales d'utilisation, toutes les lois et réglementations applicables, et acceptez que vous êtes responsable du respect des lois locales applicables.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Utilisation du Service</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Notre application permet aux utilisateurs de créer des vitrines virtuelles et de publier des annonces. Vous vous engagez à ne pas publier de contenu illégal, offensant ou trompeur.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Responsabilité</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Andy n'est qu'une plateforme de mise en relation. Nous ne sommes pas responsables des transactions entre acheteurs et vendeurs ni de la qualité des produits présentés.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Propriété Intellectuelle</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Le contenu publié par les utilisateurs reste leur propriété. Toutefois, en publiant sur la plateforme, vous nous accordez une licence mondiale pour afficher et diffuser ce contenu.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Modifications</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Nous nous réservons le droit de modifier ces conditions à tout moment sans préavis. En continuant à utiliser l'application, vous acceptez d'être lié par la version alors en vigueur de ces conditions.
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
