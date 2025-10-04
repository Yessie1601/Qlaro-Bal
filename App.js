// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme as PaperDefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import QuarterScreen from './screens/QuarterScreen';
import SettingsScreen from './screens/SettingsScreen';
import IntroScreen from './screens/IntroScreen';
import SelectOptionsScreen from './screens/SelectOptionsScreen'; // <-- Add this import
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from './components/SplashScreen';

const Stack = createStackNavigator();

const lightTheme = {
    ...PaperDefaultTheme,
    colors: {
        ...PaperDefaultTheme.colors,
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
    ...PaperDefaultTheme,
    colors: {
        ...PaperDefaultTheme.colors,
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

const navigationLightTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        background: lightTheme.colors.background,
        card: lightTheme.colors.surface,
        text: lightTheme.colors.text,
        primary: lightTheme.colors.primary,
    },
};

const navigationDarkTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        background: darkTheme.colors.background,
        card: darkTheme.colors.surface,
        text: darkTheme.colors.text,
        primary: darkTheme.colors.primary,
    },
};

export default function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [introSeen, setIntroSeen] = useState(null);
    const [language, setLanguage] = useState('en');
    const [currency, setCurrency] = useState('USD');
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        if (showSplash) return;
        (async () => {
            const value = await AsyncStorage.getItem('darkMode');
            setDarkMode(value === 'true');
            const intro = await AsyncStorage.getItem('introSeen');
            setIntroSeen(intro === 'true');
            const lang = await AsyncStorage.getItem('language');
            if (lang) setLanguage(lang);
            const curr = await AsyncStorage.getItem('currency');
            if (curr) setCurrency(curr);
        })();
    }, [showSplash]);

    const handleSetLanguage = async (lang) => {
        setLanguage(lang);
        await AsyncStorage.setItem('language', lang);
    };

    const handleSetCurrency = async (curr) => {
        setCurrency(curr);
        await AsyncStorage.setItem('currency', curr);
    };

    const theme = darkMode ? darkTheme : lightTheme;
    const navTheme = darkMode ? navigationDarkTheme : navigationLightTheme;

    if (showSplash) {
        return <SplashScreen theme={theme} onFinish={() => setShowSplash(false)} />;
    }

    if (introSeen === null) {
        return null;
    }

    return (
        <PaperProvider
            theme={theme}
            settings={{
                icon: (props) => <Icon {...props} />,
            }}
        >
            <NavigationContainer theme={navTheme}>
                <Stack.Navigator
                    initialRouteName={introSeen ? 'Home' : 'Intro'}
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.surface },
                        headerTintColor: theme.colors.text,
                        headerTitleStyle: { color: theme.colors.text },
                    }}
                >
                    <Stack.Screen name="Intro" options={{ headerShown: false }}>
                        {(props) => (
                            <IntroScreen
                                {...props}
                                theme={theme}
                                language={language}
                                setLanguage={handleSetLanguage}
                                currency={currency}
                                setCurrency={handleSetCurrency}
                            />
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="SelectOptions">
                        {(props) => (
                            <SelectOptionsScreen
                                {...props}
                                theme={theme}
                                language={language}
                                setLanguage={handleSetLanguage}
                                currency={currency}
                                setCurrency={handleSetCurrency}
                            />
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="Home" options={{ headerShown: false }}>
                        {(props) => (
                            <HomeScreen
                                {...props}
                                theme={theme}
                                language={language}
                                currency={currency}
                                setLanguage={handleSetLanguage}
                                setCurrency={handleSetCurrency}
                            />
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="Quarter">
                        {(props) => (
                            <QuarterScreen
                                {...props}
                                theme={theme}
                                language={language}
                                currency={currency}
                            />
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="Settings">
                        {(props) => (
                            <SettingsScreen
                                {...props}
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                                theme={theme}
                                language={language}
                                setLanguage={handleSetLanguage}
                                currency={currency}
                                setCurrency={handleSetCurrency}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style={darkMode ? 'light' : 'dark'} />
        </PaperProvider>
    );
}
