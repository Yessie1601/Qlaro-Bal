import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const IntroScreen = ({ navigation, theme }) => {
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
                <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>
                    Welcome to Accounting App!
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 18, marginBottom: 32 }}>
                    Track your income and expenditure by quarter.
                </Text>
                <Button
                    mode="contained"
                    style={{ backgroundColor: theme.colors.button }}
                    labelStyle={{ color: theme.colors.text }}
                    onPress={() => navigation.replace('Home', { theme })}
                >
                    Get Started
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
});

export default IntroScreen;
