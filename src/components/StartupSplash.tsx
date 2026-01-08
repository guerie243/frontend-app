import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, useWindowDimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

/**
 * LOGO_ASSET - Utilisation directe de l'asset source
 */
const LOGO_ASSET = require('../../assets/images/logo_andy.png');

/**
 * StartupSplash
 * 
 * Écran de démarrage PREMIUM.
 * Affiche UNIQUEMENT le logo Andy au centre avec une animation de pulsation.
 */
export const StartupSplash = () => {
    const { width } = useWindowDimensions();

    // Animation constants
    const scale = useSharedValue(1);
    const logoSize = Math.min(width * 0.65, 250); // Légèrement plus grand

    useEffect(() => {
        // 1. On cache le splash natif après un court délai pour laisser au JS le temps de s'afficher
        const timer = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
        }, 250); // 250ms est idéal pour éviter le flash blanc tout en étant réactif

        // 2. Animation de pulsation continue (très fluide et lente)
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <Animated.View style={[styles.contentGroup, animatedStyle]}>
                <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
                    <Image
                        source={LOGO_ASSET}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* 
                   On supprime le loader qui "cache" le logo ou distrait l'utilisateur.
                   L'animation de pulsation suffit pour montrer que ça charge.
                */}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Fond blanc pur pour matcher le splash natif
    },
    contentGroup: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});

export default StartupSplash;
