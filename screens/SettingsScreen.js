import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Modal, Text } from 'react-native';
import { TextInput, Button, Divider, Snackbar, Switch } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getSettings, updateSettings, exportData, getCurrency, setCurrency, addTransaction } from '../services/storageService';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { supportedLanguages, setLanguage, getCurrentLanguage, t  } from '../i18n';

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
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    const [exportQuarter, setExportQuarter] = useState('All');
    const [exportType, setExportType] = useState('Both');
    const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({length: 8}, (_, i) => currentYear - 5 + i);

    useEffect(() => {
        loadSettings();
        loadCurrency();
        return navigation.addListener('focus', () => {
            loadSettings();
            loadCurrency();
        });
    }, [navigation]);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings.q1_start) {
                const {month, day} = parseQuarterStart(settings.q1_start);
                setQ1Month(month);
                setQ1Day(day);
            }
            if (settings.q2_start) {
                const {month, day} = parseQuarterStart(settings.q2_start);
                setQ2Month(month);
                setQ2Day(day);
            }
            if (settings.q3_start) {
                const {month, day} = parseQuarterStart(settings.q3_start);
                setQ3Month(month);
                setQ3Day(day);
            }
            if (settings.q4_start) {
                const {month, day} = parseQuarterStart(settings.q4_start);
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
            const fileUri = await exportData(exportYear, exportQuarter, exportType, 'xlsx');
            const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            await Sharing.shareAsync(fileUri, {
                mimeType,
                dialogTitle: 'Share exported data'
            });
            showSnackbar(`Exported to: ${fileUri}`);
        } catch (error) {
            showSnackbar('Error exporting data');
        }
    };

    const handleImportData = () => {
        setImportModalVisible(true);
    };

    const handleImportConfirm = async () => {
        setImportModalVisible(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/csv'
            });

            const asset = result.assets && result.assets[0];
            if (!asset || !asset.uri) {
                showSnackbar('No file selected or file not accessible');
                return;
            }

            let fileContent;
            try {
                fileContent = await fetch(asset.uri).then(res => res.arrayBuffer());
            } catch (fetchError) {
                showSnackbar('Unable to read file. Try downloading it locally first.');
                return;
            }

            let importedData = [];
            const text = new TextDecoder().decode(fileContent);
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            if (lines.length < 2) {
                showSnackbar('CSV file is empty or invalid');
                return;
            }
            const [headerLine, ...dataLines] = lines;
            const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
            importedData = dataLines.map(line => {
                const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                const obj = {};
                headers.forEach((h, i) => obj[h] = values[i]);
                return obj;
            });

            if (!importedData.length) {
                showSnackbar('No data found to import');
                return;
            }
            let importedCount = 0;
            for (const t of importedData) {
                if (!t.Quarter || !t.Type || !t.Amount || !t.Date || !t.Year) continue;
                await addTransaction(
                    Number(t.Quarter),
                    t.Type,
                    Number(t.Amount),
                    Number(t.Tax || 0),
                    Number(t['Receipt Amount'] || 0),
                    t.Description || '',
                    t.Date,
                    Number(t.Year)
                );
                importedCount++;
            }
            if (importedCount > 0) {
                showSnackbar('Import successful');
            } else {
                showSnackbar('No valid rows found to import');
            }
        } catch (error) {
            showSnackbar('Error importing data');
        }
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#ffffff']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{flex: 1}}
        >
            <ScrollView style={[styles.container, {backgroundColor: 'transparent'}]}>
                <View style={styles.row}>
                    <Text style={{flex: 1, color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}}>{t('darkMode')}</Text>
                    <Switch value={darkMode} onValueChange={handleToggleDarkMode} color={theme.colors.button}/>
                </View>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.surface}]}/>
                <View style={styles.row}>
                    <Text style={{flex: 1, color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}}>
                        {t('language')}
                    </Text>
                    <View style={{
                        borderWidth: 1,
                        borderColor: theme.colors.button,
                        borderRadius: 8,
                        width: 150,
                        backgroundColor: theme.colors.surface
                    }}>
                        <Picker
                            selectedValue={selectedLanguage}
                            onValueChange={lang => {
                                setSelectedLanguage(lang);
                                setLanguage(lang);
                            }}
                            style={{color: theme.colors.text}}
                            dropdownIconColor={theme.colors.button}
                        >
                            {supportedLanguages.map(lang => (
                                <Picker.Item key={lang.value} label={lang.label} value={lang.value}/>
                            ))}
                        </Picker>
                    </View>
                </View>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.surface}]}/>
                <View style={styles.row}>
                    <Text style={{flex: 1, color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}}>
                        {t('currency')}
                    </Text>
                    <View style={{
                        borderWidth: 1,
                        borderColor: theme.colors.button,
                        borderRadius: 8,
                        width: 150,
                        backgroundColor: theme.colors.surface
                    }}>
                        <Picker
                            selectedValue={currency}
                            onValueChange={async value => {
                                setCurrencyState(value);
                                await setCurrency(value);
                                showSnackbar('Currency saved');
                            }}
                            style={{color: theme.colors.text}}
                            dropdownIconColor={theme.colors.button}
                        >
                            {currencyOptions.map(option => (
                                <Picker.Item key={option.label} label={`${option.label} (${option.symbol})`} value={option.label}/>
                            ))}
                        </Picker>
                    </View>
                </View>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.surface}]}/>

                <Text style={[styles.sectionTitle, {color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}]}>
                    {t('quarterDates')}
                </Text>

                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('q1Month')}
                        value={q1Month}
                        onChangeText={setQ1Month}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('q1Day')}
                        value={q1Day}
                        onChangeText={setQ1Day}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('q2Month')}
                        value={q2Month}
                        onChangeText={setQ2Month}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('q2Day')}
                        value={q2Day}
                        onChangeText={setQ2Day}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('q3Month')}
                        value={q3Month}
                        onChangeText={setQ3Month}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('q3Day')}
                        value={q3Day}
                        onChangeText={setQ3Day}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('q4Month')}
                        value={q4Month}
                        onChangeText={setQ4Month}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('q4Day')}
                        value={q4Day}
                        onChangeText={setQ4Day}
                        style={[styles.inputHalf, {backgroundColor: theme.colors.surface}]}
                        textColor={theme.colors.text}
                        selectionColor={theme.colors.text}
                        cursorColor={theme.colors.text}
                        placeholderTextColor={theme.colors.text}
                        keyboardType="number-pad"
                        maxLength={2}
                        outlineColor={theme.colors.button}
                        activeOutlineColor={theme.colors.button}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSaveSettings}
                    style={[styles.button, {backgroundColor: theme.colors.button}]}
                    labelStyle={{color: theme.colors.text}}
                >
                    {t('saveSettings')}
                </Button>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.surface}]}/>
                <Button
                    mode="contained"
                    icon="export"
                    onPress={handleExportData}
                    style={[styles.button, {backgroundColor: theme.colors.button}]}
                    labelStyle={{color: theme.colors.text}}
                >
                    {t('exportData')}
                </Button>
                <Button
                    mode="contained"
                    icon="import"
                    onPress={handleImportData}
                    style={[styles.button, {backgroundColor: theme.colors.button}]}
                    labelStyle={{color: theme.colors.text}}
                >
                    {t('importData')}
                </Button>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{backgroundColor: theme.colors.surface}}
                >
                    <Text style={{color: theme.colors.text, fontSize: 16, fontWeight: 'bold'}}>{snackbarMessage}</Text>
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
                        <Text style={{color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}}>{t('exportOptions')}</Text>
                        <View style={{marginBottom: 12}}>
                            <Text style={{color: theme.colors.text, marginTop: 8}}>{t('fileType')}</Text>
                            <View style={{
                                borderWidth: 1,
                                borderColor: theme.colors.button,
                                borderRadius: 8,
                                marginBottom: 8
                            }}>
                                <Picker
                                    selectedValue="xlsx"
                                    onValueChange={() => {}}
                                    style={{color: theme.colors.text}}
                                    dropdownIconColor={theme.colors.button}
                                    enabled={false}
                                >
                                    <Picker.Item label="Excel (.xlsx)" value="xlsx"/>
                                </Picker>
                            </View>
                            <Text style={{color: theme.colors.text, marginTop: 8}}>{t('year')}</Text>
                            <View style={{
                                borderWidth: 1,
                                borderColor: theme.colors.button,
                                borderRadius: 8,
                                marginBottom: 8
                            }}>
                                <Picker
                                    selectedValue={exportYear}
                                    onValueChange={setExportYear}
                                    style={{color: theme.colors.text}}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    {yearOptions.map(year => (
                                        <Picker.Item key={year} label={year.toString()} value={year}/>
                                    ))}
                                </Picker>
                            </View>
                            <Text style={{color: theme.colors.text, marginTop: 8}}>{t('quarter')}</Text>
                            <View style={{
                                borderWidth: 1,
                                borderColor: theme.colors.button,
                                borderRadius: 8,
                                marginBottom: 8
                            }}>
                                <Picker
                                    selectedValue={exportQuarter}
                                    onValueChange={setExportQuarter}
                                    style={{color: theme.colors.text}}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    <Picker.Item label={t('allQuarters')} value="All"/>
                                    <Picker.Item label="Q1" value="1"/>
                                    <Picker.Item label="Q2" value="2"/>
                                    <Picker.Item label="Q3" value="3"/>
                                    <Picker.Item label="Q4" value="4"/>
                                </Picker>
                            </View>
                            <Text style={{color: theme.colors.text, marginTop: 8}}>{t('type')}</Text>
                            <View style={{
                                borderWidth: 1,
                                borderColor: theme.colors.button,
                                borderRadius: 8,
                                marginBottom: 8
                            }}>
                                <Picker
                                    selectedValue={exportType}
                                    onValueChange={setExportType}
                                    style={{color: theme.colors.text}}
                                    dropdownIconColor={theme.colors.button}
                                >
                                    <Picker.Item label={`${t('income')} & ${t('expenditure')}`} value="Both"/>
                                    <Picker.Item label={t('income')} value="income"/>
                                    <Picker.Item label={t('expenditure')} value="expenditure"/>
                                </Picker>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 16}}>
                            <Button onPress={() => setExportModalVisible(false)}>{t('cancel')}</Button>
                            <Button
                                mode="contained"
                                onPress={handleExportConfirm}
                            >
                                {t('export')}
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={importModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setImportModalVisible(false)}
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
                        <Text style={{color: theme.colors.text, fontSize: 20, fontWeight: 'bold'}}>{t('importOptions')}</Text>
                        <Text style={{color: theme.colors.text, marginTop: 8}}>{t('fileType')}</Text>
                        <Text style={{color: theme.colors.text, marginBottom: 8}}>CSV (.csv)</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 16}}>
                            <Button onPress={() => setImportModalVisible(false)}>{t('cancel')}</Button>
                            <Button
                                mode="contained"
                                onPress={handleImportConfirm}
                            >
                                {t('import')}
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
        paddingHorizontal: 15,
    },
    sectionTitle: {
        marginVertical: 5,
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
        marginBottom: 32,
    },
    divider: {
        marginVertical: 8,
        height: 1,
    }
});

export default SettingsScreen;
