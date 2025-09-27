import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import QuarterScreen from './screens/QuarterScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

const theme = {
    ...DefaultTheme, colors: {
        ...DefaultTheme.colors, primary: '#8d3f21', accent: '#581423',
    },
};

export default function App() {
    return (<PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home" id={"mainStack"}>
                    <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
                    <Stack.Screen name="Quarter" component={QuarterScreen}/>
                    <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}}/>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto"/>
        </PaperProvider>);
}