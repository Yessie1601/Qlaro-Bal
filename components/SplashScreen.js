import React, { useEffect } from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = ({ onFinish, theme }) => {
    useEffect(() => {
        const timer = setTimeout(onFinish, 1500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
        <View style={styles.container}>
            <Image source={require('../assets/icon.png')} style={styles.logo} />
            <Text>Qlaro-Bal</Text>
        </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
});

export default SplashScreen;
