import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    withScrollView?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={[
            styles.container,
            {
                paddingTop: insets.top,
                backgroundColor: theme.colors.background
            },
            style
        ]}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
