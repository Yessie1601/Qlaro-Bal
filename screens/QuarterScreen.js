// screens/QuarterScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal';
import { getTransactions, addTransaction, getCurrency } from '../services/storageService';
import moment from 'moment';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const QuarterScreen = ({ navigation, route }) => {
    const { quarter, startDate, year } = route.params;
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [expenditureTransactions, setExpenditureTransactions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentType, setCurrentType] = useState('income');
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        navigation.setOptions({
            title: `Quarter ${quarter} (${moment(startDate).format('MMM D')})`
        });

        loadTransactions();
        loadCurrency();
    }, [quarter, startDate, year]);

    const loadTransactions = async () => {
        try {
            const income = await getTransactions(quarter, 'income', year);
            const expenditures = await getTransactions(quarter, 'expenditure', year);
            setIncomeTransactions(income);
            setExpenditureTransactions(expenditures);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const loadCurrency = async () => {
        try {
            const curr = await getCurrency();
            setCurrency(curr);
        } catch (error) {
            setCurrency('USD');
        }
    };

    const handleAddPress = (type) => {
        setCurrentType(type);
        setModalVisible(true);
    };

    const handleSaveTransaction = async (transaction) => {
        try {
            await addTransaction(
                transaction.quarter,
                transaction.type,
                transaction.amount,
                transaction.tax,
                transaction.receipt_amount,
                transaction.description,
                transaction.date
            );

            setModalVisible(false);
            loadTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const currencyObj = currencyOptions.find(c => c.label === currency) || currencyOptions[0];
    const currencySymbol = currencyObj.symbol;
    const currencyIcon = currencyObj.icon;

    return (
        <View style={styles.container}>
            <AddTransactionModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onSave={handleSaveTransaction}
                type={currentType}
                quarter={quarter}
                year={route.params.year}
            />
            <View style={styles.listsContainer}>
                <View style={styles.listContainer}>
                    <TransactionList
                        transactions={incomeTransactions}
                        type="income"
                        onAddPress={handleAddPress}
                        currencySymbol={currencySymbol}
                        currencyIcon={currencyIcon}
                    />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.listContainer}>
                    <TransactionList
                        transactions={expenditureTransactions}
                        type="expenditure"
                        onAddPress={handleAddPress}
                        currencySymbol={currencySymbol}
                        currencyIcon={currencyIcon}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listsContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    divider: {
        width: 1,
        backgroundColor: '#e0e0e0',
    },
});

export default QuarterScreen;

