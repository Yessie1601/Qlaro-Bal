import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';

const SETTINGS_KEY = 'settings';
const TRANSACTIONS_KEY = 'transactions';
const CURRENCY_KEY = 'user_currency';

export const initDatabase = async () => {
    try {
        const settings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!settings) {
            const currentYear = new Date().getFullYear();
            const defaultSettings = {
                id: 1,
                year: currentYear,
                q1_start: '01-01',
                q2_start: '04-01',
                q3_start: '07-01',
                q4_start: '10-01'
            };
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
        const transactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        if (!transactions) {
            await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
        }
        const currency = await AsyncStorage.getItem(CURRENCY_KEY);
        if (!currency) {
            await AsyncStorage.setItem(CURRENCY_KEY, 'USD');
        }
    } catch (error) {
        console.error('Init error:', error);
        throw error;
    }
};

export const getSettings = async () => {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settings) return JSON.parse(settings);
    throw new Error('No settings found');
};

export const updateSettings = async (q1_start, q2_start, q3_start, q4_start) => {
    const settings = await getSettings();
    const year = settings.year || new Date().getFullYear();
    const newSettings = { id: 1, year, q1_start, q2_start, q3_start, q4_start };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

    // Remove transactions not in the selected year
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    const filtered = transactions.filter(t => (t.year || new Date(t.date).getFullYear()) === year);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
};

export const getTransactions = async (quarter, type, year) => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    return transactions
        .filter(t => t.quarter === quarter && t.type === type && ((t.year || new Date(t.date).getFullYear()) === year))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addTransaction = async (quarter, type, amount, tax, receipt_amount, description, date, year) => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    const newTransaction = {
        id: Date.now(),
        quarter,
        type,
        amount,
        tax,
        receipt_amount,
        description,
        date,
        year: year || new Date(date).getFullYear()
    };
    transactions.push(newTransaction);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction.id;
};

export const getTotals = async (year) => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    const filtered = transactions.filter(t => (t.year || new Date(t.date).getFullYear()) === year);
    const totals = {
        1: { quarter: 1, income_total: 0, expenditure_total: 0 },
        2: { quarter: 2, income_total: 0, expenditure_total: 0 },
        3: { quarter: 3, income_total: 0, expenditure_total: 0 },
        4: { quarter: 4, income_total: 0, expenditure_total: 0 }
    };
    filtered.forEach(t => {
        if (t.type === 'income') totals[t.quarter].income_total += t.amount;
        if (t.type === 'expenditure') totals[t.quarter].expenditure_total += t.amount;
    });
    return Object.values(totals);
};

export const exportData = async () => {
    try {
        const settings = await getSettings();
        const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
        const currency = await getCurrency();
        const data = { settings, transactions, currency };
        const fileUri = `${FileSystem.documentDirectory}accounting_export_${moment().format('YYYY-MM-DD_HH-mm')}.json`;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
        return fileUri;
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};

export const getCurrency = async () => {
    return (await AsyncStorage.getItem(CURRENCY_KEY)) || 'USD';
};

export const setCurrency = async (currency) => {
    await AsyncStorage.setItem(CURRENCY_KEY, currency);
};
