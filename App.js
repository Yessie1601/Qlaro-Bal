import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import QuarterScreen from './screens/QuarterScreen';
import SettingsScreen from './screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const darkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#8d3f21',
        accent: '#581423',
        background: '#181818',
        surface: '#222',
        text: '#fff',
    },
    dark: true,
};

const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#8d3f21',
        accent: '#581423',
    },
    dark: false,
};

export default function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        (async () => {
            const value = await AsyncStorage.getItem('darkMode');
            setDarkMode(value === 'true');
        })();
    }, []);

    const theme = darkMode ? darkTheme : lightTheme;

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    id={"mainStack"}
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.surface },
                        headerTintColor: theme.colors.text,
                        headerTitleStyle: { color: theme.colors.text },
                    }}
                >
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Quarter" component={QuarterScreen} />
                    <Stack.Screen
                        name="Settings"
                        options={{ title: 'Settings' }}
                    >
                        {props => (
                            <SettingsScreen
                                {...props}
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style={darkMode ? "light" : "auto"} />
        </PaperProvider>
    );
}
