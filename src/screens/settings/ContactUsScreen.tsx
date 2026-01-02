import React from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Linking } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CONTACT_CONFIG, ContactMethod } from '../../config/contactConfig';

export const ContactUsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handleContactPress = async (method: ContactMethod) => {
        const url = method.linkPrefix ? `${method.linkPrefix}${method.value}` : method.value;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.warn(`Don't know how to open URI: ${url}`);
            }
        } catch (error) {
            console.error(`Error opening URL: ${url}`, error);
        }
    };

    const renderContactItem = (method: ContactMethod) => (
        <TouchableOpacity
            key={method.id}
            style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => handleContactPress(method)}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name={method.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>{method.label}</Text>
                    <Text style={[styles.itemValue, { color: theme.colors.text }]}>{method.value}</Text>
                </View>
            </View>
            <Ionicons name="open-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    const activeContacts = CONTACT_CONFIG.filter(c => c.value && c.value.trim() !== '');

    if (activeContacts.length === 0) {
        return (
            <ScreenWrapper>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nous contacter</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="mail-unread-outline" size={64} color={theme.colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        Aucune information de contact disponible pour le moment.
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nous contacter</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    Une question ou un problème ? Notre équipe est là pour vous aider.
                    Contactez-nous via l'un des canaux suivants :
                </Text>

                <View style={styles.listContainer}>
                    {activeContacts.map(renderContactItem)}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
                        Andy App
                    </Text>
                </View>
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
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
        textAlign: 'center',
    },
    listContainer: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    itemValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});
