import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';

const defaultTheme = {
    dark: false,
    colors: {
        text: '#000',
        button: '#5865F2',
        surface: '#fff',
        background: '#f2f3f5'
    }
};

const SplashScreen = ({ theme = defaultTheme, onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 1500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image source={require('../assets/icon.png')} style={styles.logo} />
            <Text>Qlaro-Bal</Text>
            <ActivityIndicator size="large" color={theme.colors.button} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20
    }
});

export default SplashScreen;
