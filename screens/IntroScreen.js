import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroScreen = ({ navigation, theme }) => {
    const handleGetStarted = async () => {
        await AsyncStorage.setItem('introSeen', 'true');
        navigation.replace('Home', { theme });
    };

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Text style={styles.title}>{t('welcome')}</Text>
                <Text style={styles.subtitle}>{t('trackByQuarter')}</Text>
                <Button
                    mode="contained"
                    style={{ backgroundColor: theme.colors.button, marginTop: 16 }}
                    labelStyle={{ color: theme.colors.text }}
                    onPress={handleGetStarted}
                >
                    {t('getStarted')}
                </Button>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5865F2',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#060607',
        marginBottom: 32,
        textAlign: 'center',
    },
});

export default IntroScreen;

