import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

/**
 * StartupSplash
 * 
 * Écran de démarrage dédié au chargement initial de l'application.
 * Affiche le logo Andy avec une animation de pulsation et un indicateur de chargement.
 */
export const StartupSplash = () => {
    // Animation constants
    const scale = useSharedValue(0.8); // Start slightly smaller for a "pop" effect
    const opacity = useSharedValue(0); // Start invisible to fade in over native splash

    useEffect(() => {
        // 1. On cache le splash natif dès que le composant JS est monté
        SplashScreen.hideAsync().catch(() => { });

        // 2. Animation d'entrée : Fade in + Scale up
        opacity.value = withTiming(1, { duration: 600 });
        scale.value = withTiming(1, { duration: 600 }, (finished) => {
            if (finished) {
                // 3. Effet de pulsation continue après l'entrée
                scale.value = withRepeat(
                    withSequence(
                        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
                        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                );
            }
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* On groupe le logo et l'indicateur dans le même conteneur animé
                pour qu'ils apparaissent exactement en même temps */}
            <Animated.View style={[styles.contentGroup, animatedStyle]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo_andy.png')}
                        style={styles.logo}
                        contentFit="contain"
                        priority="high"
                        cachePolicy="memory-disk"
                    />
                </View>

                <ActivityIndicator
                    color="#0A84FF"
                    style={styles.loader}
                    size="small"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    contentGroup: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: width * 0.55,
        height: width * 0.55,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 45,
        // Premium shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    loader: {
        marginTop: 50, // Bien en dessous de l'image
    },
});

export default StartupSplash;
