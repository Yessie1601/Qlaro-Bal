import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';

const SETTINGS_KEY = 'settings';
const TRANSACTIONS_KEY = 'transactions';

export const initDatabase = async () => {
    try {
        const settings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!settings) {
            const currentYear = new Date().getFullYear();
            const defaultSettings = {
                id: 1,
                year: currentYear,
                q1_start: `${currentYear}-01-01`,
                q2_start: `${currentYear}-04-01`,
                q3_start: `${currentYear}-07-01`,
                q4_start: `${currentYear}-10-01`
            };
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
        const transactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        if (!transactions) {
            await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
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

export const updateSettings = async (year, q1_start, q2_start, q3_start, q4_start) => {
    const newSettings = { id: 1, year, q1_start, q2_start, q3_start, q4_start };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
};

export const getTransactions = async (quarter, type) => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    return transactions.filter(t => t.quarter === quarter && t.type === type)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addTransaction = async (quarter, type, amount, tax, receipt_amount, description, date) => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    const newTransaction = {
        id: Date.now(),
        quarter,
        type,
        amount,
        tax,
        receipt_amount,
        description,
        date
    };
    transactions.push(newTransaction);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction.id;
};

export const getTotals = async () => {
    const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
    const totals = {};
    transactions.forEach(t => {
        if (!totals[t.quarter]) {
            totals[t.quarter] = { quarter: t.quarter, income_total: 0, expenditure_total: 0 };
        }
        if (t.type === 'income') totals[t.quarter].income_total += t.amount;
        if (t.type === 'expenditure') totals[t.quarter].expenditure_total += t.amount;
    });
    return Object.values(totals).sort((a, b) => a.quarter - b.quarter);
};

export const exportData = async () => {
    try {
        const settings = await getSettings();
        const transactions = JSON.parse(await AsyncStorage.getItem(TRANSACTIONS_KEY)) || [];
        const data = { settings, transactions };
        const fileUri = `${FileSystem.documentDirectory}accounting_export_${moment().format('YYYY-MM-DD_HH-mm')}.json`;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
        return fileUri;
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};
