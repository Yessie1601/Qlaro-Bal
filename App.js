import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import QuarterScreen from './screens/QuarterScreen';
import SettingsScreen from './screens/SettingsScreen';
import IntroScreen from './screens/IntroScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#5865F2',
        accent: '#5865F2',
        background: '#f2f3f5',
        surface: '#ffffff',
        text: '#060607',
        button: '#5865F2',
        success: '#3ba55d',
        danger: '#ed4245',
    },
    dark: false,
};

const darkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#5865F2',
        accent: '#5865F2',
        background: '#2b2d31',
        surface: '#1e1f22',
        text: '#ffffff',
        button: '#5865F2',
        success: '#3ba55d',
        danger: '#ed4245',
    },
    dark: true,
};

export default function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [introSeen, setIntroSeen] = useState(null);

    useEffect(() => {
        (async () => {
            const value = await AsyncStorage.getItem('darkMode');
            setDarkMode(value === 'true');
            const intro = await AsyncStorage.getItem('introSeen');
            setIntroSeen(intro === 'true');
        })();
    }, []);

    const theme = darkMode ? darkTheme : lightTheme;

    if (introSeen === null) return null;

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
                <Stack.Navigator
                    initialRouteName={introSeen ? "Home" : "Intro"}
                    id={"mainStack"}
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.surface },
                        headerTintColor: theme.colors.text,
                        headerTitleStyle: { color: theme.colors.text },
                    }}
                >
                    <Stack.Screen name="Intro" options={{ headerShown: false }}>
                        {props => <IntroScreen {...props} theme={theme} />}
                    </Stack.Screen>
                    <Stack.Screen name="Home" options={{ headerShown: false }} >
                        {props => <HomeScreen {...props} theme={theme}/>}
                    </Stack.Screen>
                    <Stack.Screen name="Quarter">
                        {props => <QuarterScreen {...props} theme={theme} />}
                    </Stack.Screen>
                    <Stack.Screen name="Settings">
                        {props => (
                            <SettingsScreen
                                {...props}
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                                theme={theme}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="light" />
        </PaperProvider>
    );
}
