import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../i18n';

const IntroScreen = ({ navigation, theme, onIntroSeen }) => {
    const handleStart = async () => {
        if (onIntroSeen) await onIntroSeen();
        navigation.navigate('SelectOptions', { theme });
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
                    style={{ backgroundColor: theme.colors.button, marginTop: 32 }}
                    labelStyle={{ color: theme.colors.text }}
                    onPress={handleStart}
                >
                    Select Language & Currency
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
        color: '#5865F2',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    subtitle: {
        color: '#060607',
        fontSize: 18,
        marginBottom: 32,
        textAlign: 'center',
    },
});

export default IntroScreen;

