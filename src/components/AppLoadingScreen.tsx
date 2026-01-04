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
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

import { ScreenWrapper } from './ScreenWrapper';

export const AppLoadingScreen = () => {
    const { theme } = useTheme();

    // Animation constants
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Initial fade in and scale
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });

        // Continuous pulse effect
        const timeout = setTimeout(() => {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            );
        }, 800);

        return () => clearTimeout(timeout);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                    source={require('../../assets/images/logo_andy.png')}
                    style={[styles.logo, { borderRadius: 45 }]}
                    contentFit="contain"
                    transition={500}
                />
            </Animated.View>
            <ActivityIndicator
                color="#0A84FF"
                style={styles.loader}
                size="small"
            />
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
    logoContainer: {
        width: width * 0.55,
        height: width * 0.55,
        justifyContent: 'center',
        alignItems: 'center',
        // Premium shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderRadius: 45,
    },
    logo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF', // Ensure white background for the logo itself
    },
    loader: {
        marginTop: 40,
    },
});

export default AppLoadingScreen;
