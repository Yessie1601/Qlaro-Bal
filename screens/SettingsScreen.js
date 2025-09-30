import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Modal, Text } from 'react-native';
import { TextInput, Button, Divider, Snackbar, Title, Switch } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import { getSettings, updateSettings, exportData, getCurrency, setCurrency } from '../services/storageService';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const parseQuarterStart = (str) => {
    const parts = str.split('-');
    if (parts.length === 2) {
        return { month: parts[0], day: parts[1] };
    }
    if (parts.length === 3) {
        return { month: parts[1], day: parts[2] };
    }
    return { month: '01', day: '01' };
};

const SettingsScreen = ({ navigation, darkMode, setDarkMode, theme }) => {
    const [q1Month, setQ1Month] = useState('01');
    const [q1Day, setQ1Day] = useState('01');
    const [q2Month, setQ2Month] = useState('04');
    const [q2Day, setQ2Day] = useState('01');
    const [q3Month, setQ3Month] = useState('07');
    const [q3Day, setQ3Day] = useState('01');
    const [q4Month, setQ4Month] = useState('10');
    const [q4Day, setQ4Day] = useState('01');
    const [currency, setCurrencyState] = useState(currencyOptions[0].label);
    const [menuVisible, setMenuVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);
    const [exportYear, setExportYear] = useState(currentYear);
    const [exportQuarter, setExportQuarter] = useState('All');
    const [exportType, setExportType] = useState('Both');

    useEffect(() => {
        loadSettings();
        loadCurrency();
        const unsubscribe = navigation.addListener('focus', () => {
            loadSettings();
            loadCurrency();
        });
        return unsubscribe;
    }, [navigation]);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings.q1_start) {
                const { month, day } = parseQuarterStart(settings.q1_start);
                setQ1Month(month);
                setQ1Day(day);
            }
            if (settings.q2_start) {
                const { month, day } = parseQuarterStart(settings.q2_start);
                setQ2Month(month);
                setQ2Day(day);
            }
            if (settings.q3_start) {
                const { month, day } = parseQuarterStart(settings.q3_start);
                setQ3Month(month);
                setQ3Day(day);
            }
            if (settings.q4_start) {
                const { month, day } = parseQuarterStart(settings.q4_start);
                setQ4Month(month);
                setQ4Day(day);
            }
        } catch (error) {
            showSnackbar('Error loading settings');
        }
    };

    const loadCurrency = async () => {
        try {
            const curr = await getCurrency();
            setCurrencyState(curr);
        } catch (error) {
            setCurrencyState(currencyOptions[0].label);
        }
    };

    const handleSaveSettings = async () => {
        try {
            if (!validateSettings()) {
                showSnackbar('Invalid quarter dates');
                return;
            }
            await updateSettings(
                `${q1Month}-${q1Day}`,
                `${q2Month}-${q2Day}`,
                `${q3Month}-${q3Day}`,
                `${q4Month}-${q4Day}`
            );
            showSnackbar('Settings saved successfully');
        } catch (error) {
            showSnackbar('Error saving settings');
        }
    };

    const handleSaveCurrency = async () => {
        try {
            await setCurrency(currency);
            showSnackbar('Currency saved');
        } catch (error) {
            showSnackbar('Error saving currency');
        }
    };

    const handleToggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        await AsyncStorage.setItem('darkMode', newValue.toString());
        showSnackbar(newValue ? 'Dark mode enabled' : 'Dark mode disabled');
    };

    const validateSettings = () => {
        const dateFormat = 'MM-DD';
        return (
            moment(`${q1Month}-${q1Day}`, dateFormat, true).isValid() &&
            moment(`${q2Month}-${q2Day}`, dateFormat, true).isValid() &&
            moment(`${q3Month}-${q3Day}`, dateFormat, true).isValid() &&
            moment(`${q4Month}-${q4Day}`, dateFormat, true).isValid()
        );
    };

    const handleExportData = async () => {
        setExportModalVisible(true);
    };

    const handleExportConfirm = async () => {
        setExportModalVisible(false);
        try {
            const fileUri = await exportData(exportYear, exportQuarter, exportType);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            showSnackbar('Error exporting data');
        }
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const selectedCurrency = currencyOptions.find(c => c.label === currency);

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#68291a','#7d4d33', '#a0522d' ]
                : ['#d2bfa6', '#e7dacb', '#f8f4ef']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
                <View style={styles.row}>
                    <Title style={{flex: 1, color: theme.colors.text}}>Dark Mode</Title>
                    <Switch value={darkMode} onValueChange={handleToggleDarkMode} color={theme.colors.button} />
                </View>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surface }]} />
                <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>Currency</Title>
                <View>
                    <Button
                        mode="outlined"
                        onPress={() => setMenuVisible(true)}
                        style={{ borderColor: theme.colors.button }}
                        labelStyle={{ color: theme.colors.text }}
                    >
                        {selectedCurrency ? `${selectedCurrency.label} (${selectedCurrency.symbol})` : 'Select Currency'}
                    </Button>
                    {menuVisible && (
                        <View style={{
                            position: 'absolute',
                            top: 40,
                            left: 0,
                            right: 0,
                            backgroundColor: theme.colors.surface,
                            borderRadius: 8,
                            zIndex: 10,
                            elevation: 10
                        }}>
                            {currencyOptions.map(option => (
                                <Button
                                    key={option.label}
                                    onPress={() => {
                                        setCurrencyState(option.label);
                                        setMenuVisible(false);
                                    }}
                                    style={{ borderColor: theme.colors.button }}
                                    labelStyle={{ color: theme.colors.text }}
                                >
                                    {`${option.label} (${option.symbol})`}
                                </Button>
                            ))}
                        </View>
                    )}
                </View>
                <Button
                    mode="contained"
                    onPress={handleSaveCurrency}
                    style={[styles.button, { backgroundColor: theme.colors.button }]}
                    labelStyle={{ color: theme.colors.text }}
                >
                    Save Currency
                </Button>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surface }]} />
                <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>Quarter Dates</Title>
                <View style={styles.row}>
                    <TextInput
                        label="Q1 Month (MM)"
                        value={q1Month}
                        onChangeText={setQ1Month}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                    <TextInput
                        label="Q1 Day (DD)"
                        value={q1Day}
                        onChangeText={setQ1Day}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        label="Q2 Month (MM)"
                        value={q2Month}
                        onChangeText={setQ2Month}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                    <TextInput
                        label="Q2 Day (DD)"
                        value={q2Day}
                        onChangeText={setQ2Day}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        label="Q3 Month (MM)"
                        value={q3Month}
                        onChangeText={setQ3Month}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                    <TextInput
                        label="Q3 Day (DD)"
                        value={q3Day}
                        onChangeText={setQ3Day}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        label="Q4 Month (MM)"
                        value={q4Month}
                        onChangeText={setQ4Month}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                    <TextInput
                        label="Q4 Day (DD)"
                        value={q4Day}
                        onChangeText={setQ4Day}
                        style={[styles.inputHalf, { backgroundColor: theme.colors.surface }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        theme={{ colors: { text: theme.colors.text, background: theme.colors.surface, placeholder: theme.colors.text } }}
                    />
                </View>
                <Button
                    mode="contained"
                    onPress={handleSaveSettings}
                    style={[styles.button, { backgroundColor: theme.colors.button }]}
                    labelStyle={{ color: theme.colors.text }}
                >
                    Save Settings
                </Button>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surface }]} />
                <Button
                    mode="contained"
                    icon="export"
                    onPress={handleExportData}
                    style={[styles.button, { backgroundColor: theme.colors.button }]}
                    labelStyle={{ color: theme.colors.text }}
                >
                    Export Data
                </Button>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{ backgroundColor: theme.colors.surface }}
                >
                    <Title style={{ color: theme.colors.text, fontSize: 16 }}>{snackbarMessage}</Title>
                </Snackbar>
            </ScrollView>
            <Modal
                visible={exportModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setExportModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <View style={{
                        backgroundColor: theme.colors.surface,
                        padding: 24,
                        borderRadius: 16,
                        width: '80%'
                    }}>
                        <Title style={{ color: theme.colors.text }}>Export Options</Title>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ color: theme.colors.text, marginTop: 8 }}>Year</Text>
                            <View style={{ borderWidth: 1, borderColor: theme.colors.button, borderRadius: 8, marginBottom: 8 }}>
                                <Picker
                                    selectedValue={exportYear}
                                    onValueChange={setExportYear}
                                    style={{ color: theme.colors.text }}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    {yearOptions.map(year => (
                                        <Picker.Item key={year} label={year.toString()} value={year} />
                                    ))}
                                </Picker>
                            </View>
                            <Text style={{ color: theme.colors.text, marginTop: 8 }}>Quarter</Text>
                            <View style={{ borderWidth: 1, borderColor: theme.colors.button, borderRadius: 8, marginBottom: 8 }}>
                                <Picker
                                    selectedValue={exportQuarter}
                                    onValueChange={setExportQuarter}
                                    style={{ color: theme.colors.text }}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    <Picker.Item label="All Quarters" value="All" />
                                    <Picker.Item label="Q1" value="1" />
                                    <Picker.Item label="Q2" value="2" />
                                    <Picker.Item label="Q3" value="3" />
                                    <Picker.Item label="Q4" value="4" />
                                </Picker>
                            </View>
                            <Text style={{ color: theme.colors.text, marginTop: 8 }}>Type</Text>
                            <View style={{ borderWidth: 1, borderColor: theme.colors.button, borderRadius: 8, marginBottom: 8 }}>
                                <Picker
                                    selectedValue={exportType}
                                    onValueChange={setExportType}
                                    style={{ color: theme.colors.text }}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    <Picker.Item label="Income & Expenditure" value="Both" />
                                    <Picker.Item label="Income" value="income" />
                                    <Picker.Item label="Expenditure" value="expenditure" />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                            <Button onPress={() => setExportModalVisible(false)}>Cancel</Button>
                            <Button
                                mode="contained"
                                onPress={handleExportConfirm}
                            >
                                Export
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        marginVertical: 8,
    },
    inputHalf: {
        flex: 1,
        marginBottom: 12,
        marginRight: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        marginVertical: 8,
    },
    divider: {
        marginVertical: 8,
        height: 1,
    }
});

export default SettingsScreen;
