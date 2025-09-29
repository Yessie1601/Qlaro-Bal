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

const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#68291a',
        accent: '#937f75',
        background: '#7d4d33',
        surface: '#937f75',
        text: '#fff',
        button: '#937f75',
    },
    dark: false,
};

const darkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#68291a',
        accent: '#937f75',
        background: '#68291a',
        surface: '#7d4d33',
        text: '#fff',
        button: '#7d4d33',
    },
    dark: true,
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
            <NavigationContainer theme={theme}>
                <Stack.Navigator
                    initialRouteName="Home"
                    id={"mainStack"}
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.surface },
                        headerTintColor: theme.colors.text,
                        headerTitleStyle: { color: theme.colors.text },
                    }}
                >
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
