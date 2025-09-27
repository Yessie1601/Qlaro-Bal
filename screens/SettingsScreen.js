import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, Button, Divider, Snackbar, Title, Menu } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import { getSettings, updateSettings, exportData, getCurrency, setCurrency } from '../services/storageService';
import moment from 'moment';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const SettingsScreen = ({ navigation }) => {
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
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadSettings();
        loadCurrency();
        const unsubscribe = navigation.addListener('focus', loadSettings);
        return unsubscribe;
    }, [navigation]);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            setSelectedYear(settings.year || new Date().getFullYear());
            if (settings.q1_start) {
                const [m, d] = settings.q1_start.split('-');
                setQ1Month(m);
                setQ1Day(d);
            }
            if (settings.q2_start) {
                const [m, d] = settings.q2_start.split('-');
                setQ2Month(m);
                setQ2Day(d);
            }
            if (settings.q3_start) {
                const [m, d] = settings.q3_start.split('-');
                setQ3Month(m);
                setQ3Day(d);
            }
            if (settings.q4_start) {
                const [m, d] = settings.q4_start.split('-');
                setQ4Month(m);
                setQ4Day(d);
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
                showSnackbar('Please enter valid month and day for each quarter');
                return;
            }
            await updateSettings(
                selectedYear,
                `${selectedYear}-${q1Month}-${q1Day}`,
                `${selectedYear}-${q2Month}-${q2Day}`,
                `${selectedYear}-${q3Month}-${q3Day}`,
                `${selectedYear}-${q4Month}-${q4Day}`
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

    const validateSettings = () => {
        const dateFormat = 'YYYY-MM-DD';
        return (
            moment(`${selectedYear}-${q1Month}-${q1Day}`, dateFormat, true).isValid() &&
            moment(`${selectedYear}-${q2Month}-${q2Day}`, dateFormat, true).isValid() &&
            moment(`${selectedYear}-${q3Month}-${q3Day}`, dateFormat, true).isValid() &&
            moment(`${selectedYear}-${q4Month}-${q4Day}`, dateFormat, true).isValid()
        );
    };

    const handleExportData = async () => {
        try {
            const fileUri = await exportData();
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
        <ScrollView style={styles.container}>
            <Title style={styles.sectionTitle}>Quarter Dates</Title>
            <View style={styles.row}>
                <TextInput
                    label="Q1 Month (MM)"
                    value={q1Month}
                    onChangeText={setQ1Month}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
                <TextInput
                    label="Q1 Day (DD)"
                    value={q1Day}
                    onChangeText={setQ1Day}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </View>
            <View style={styles.row}>
                <TextInput
                    label="Q2 Month (MM)"
                    value={q2Month}
                    onChangeText={setQ2Month}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
                <TextInput
                    label="Q2 Day (DD)"
                    value={q2Day}
                    onChangeText={setQ2Day}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </View>
            <View style={styles.row}>
                <TextInput
                    label="Q3 Month (MM)"
                    value={q3Month}
                    onChangeText={setQ3Month}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
                <TextInput
                    label="Q3 Day (DD)"
                    value={q3Day}
                    onChangeText={setQ3Day}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </View>
            <View style={styles.row}>
                <TextInput
                    label="Q4 Month (MM)"
                    value={q4Month}
                    onChangeText={setQ4Month}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
                <TextInput
                    label="Q4 Day (DD)"
                    value={q4Day}
                    onChangeText={setQ4Day}
                    style={styles.inputHalf}
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </View>
            <Button
                mode="contained"
                onPress={handleSaveSettings}
                style={styles.button}
            >
                Save Settings
            </Button>
            <Divider style={styles.divider} />
            <Title style={styles.sectionTitle}>Currency</Title>
            <View style={{ marginBottom: 12 }}>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            icon={selectedCurrency?.icon}
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                        >
                            {selectedCurrency?.label}
                        </Button>
                    }
                >
                    {currencyOptions.map(option => (
                        <Menu.Item
                            key={option.label}
                            onPress={() => {
                                setCurrencyState(option.label);
                                setMenuVisible(false);
                            }}
                            title={`${option.label} ${option.symbol}`}
                            leadingIcon={option.icon}
                        />
                    ))}
                </Menu>
            </View>
            <Button
                mode="contained"
                onPress={handleSaveCurrency}
                style={styles.button}
            >
                Save Currency
            </Button>
            <Divider style={styles.divider} />
            <Title style={styles.sectionTitle}>Data Management</Title>
            <Button
                mode="contained"
                icon="export"
                onPress={handleExportData}
                style={styles.button}
            >
                Export Data
            </Button>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
        marginVertical: 16,
    },
    yearBox: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    inputHalf: {
        flex: 1,
        marginBottom: 12,
        marginRight: 8,
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        marginVertical: 8,
    },
    divider: {
        marginVertical: 24,
    },
});

export default SettingsScreen;

