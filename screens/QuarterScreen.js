import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {Button, Divider, Modal, Portal} from 'react-native-paper';
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal';
import {addTransaction, getCurrency, getTransactions, deleteTransaction} from '../services/storageService';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import {t} from '../i18n';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const PHONE_WIDTH = 600;

const QuarterScreen = ({ navigation, route, theme }) => {
    const { quarter, startDate, year } = route.params;
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [expenditureTransactions, setExpenditureTransactions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentType, setCurrentType] = useState('income');
    const [currency, setCurrency] = useState('USD');
    const [activeList, setActiveList] = useState('income');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const { width } = useWindowDimensions();
    const isPhone = width < PHONE_WIDTH;

    useEffect(() => {
        navigation.setOptions({
            title: `Quarter ${quarter} (${moment(startDate).format('MMM D')})`
        });

        loadTransactions();
        loadCurrency();
    }, []);

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

    const handleTransactionPress = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailModalVisible(true);
    };

    const handleDeleteTransaction = async () => {
        if (selectedTransaction) {
            try {
                await deleteTransaction(
                    selectedTransaction.quarter,
                    selectedTransaction.type,
                    selectedTransaction.date
                );
                setDetailModalVisible(false);
                setConfirmDeleteVisible(false);
                loadTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const currencyObj = currencyOptions.find(c => c.label === currency) || currencyOptions[0];
    const currencySymbol = currencyObj.symbol;
    const currencyIcon = currencyObj.icon;

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <AddTransactionModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    onSave={handleSaveTransaction}
                    type={currentType}
                    quarter={quarter}
                    year={year}
                />
                <Portal>
                    <Modal
                        visible={detailModalVisible}
                        onDismiss={() => setDetailModalVisible(false)}
                        contentContainerStyle={{ margin: 24, backgroundColor: theme.colors.surface, padding: 24, borderRadius: 8 }}
                    >
                        {selectedTransaction && (
                            <>
                                <Text style={{ color: theme.colors.text }}>{t('quarter')}: {selectedTransaction.quarter}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('date')}: {moment(selectedTransaction.date).format('MMM D, YYYY')}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('type')}: {t(selectedTransaction.type)}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('amount')}: {currencySymbol}{selectedTransaction.amount.toFixed(2)}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('tax')}: {Math.round(selectedTransaction.tax)}%</Text>
                                <Text style={{ color: theme.colors.text }}>{t('taxValue')}: {currencySymbol}{(selectedTransaction.amount * selectedTransaction.tax / 100).toFixed(2)}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('receipt')}: {currencySymbol}{selectedTransaction.receipt_amount.toFixed(2)}</Text>
                                <Text style={{ color: theme.colors.text }}>{t('description')}: {selectedTransaction.description}</Text>
                                <Button onPress={() => setDetailModalVisible(false)} style={{ marginTop: 16, backgroundColor: theme.colors.button }} labelStyle={{ color: theme.colors.text }}>{t('close')}</Button>
                                <Button
                                    onPress={() => setConfirmDeleteVisible(true)}
                                    style={{ marginTop: 8, backgroundColor: theme.colors.danger }}
                                    labelStyle={{ color: theme.colors.text }}
                                >
                                    {t('delete')}
                                </Button>
                            </>
                        )}
                    </Modal>
                    <Modal
                        visible={confirmDeleteVisible}
                        onDismiss={() => setConfirmDeleteVisible(false)}
                        contentContainerStyle={{ margin: 24, backgroundColor: theme.colors.surface, padding: 24, borderRadius: 8 }}
                    >
                        <Text style={{ color: theme.colors.text, marginBottom: 16 }}>
                            {t('areYouSureDelete')}
                        </Text>
                        <Button
                            onPress={handleDeleteTransaction}
                            style={{ backgroundColor: theme.colors.danger, marginBottom: 8 }}
                            labelStyle={{ color: theme.colors.text }}
                        >
                            {t('confirm')}
                        </Button>
                        <Button
                            onPress={() => setConfirmDeleteVisible(false)}
                            style={{ backgroundColor: theme.colors.button }}
                            labelStyle={{ color: theme.colors.text }}
                        >
                            {t('cancel')}
                        </Button>
                    </Modal>
                </Portal>
                {isPhone ? (
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor: activeList === 'income'
                                        ? theme.colors.button
                                        : theme.dark ? '#1e1f22' : '#fff',
                                    borderColor: theme.colors.button,
                                    borderWidth: 1,
                                }
                            ]}
                            onPress={() => setActiveList('income')}
                        >
                            <Text style={{
                                color: activeList === 'income'
                                    ? theme.colors.text
                                    : theme.colors.button,
                                fontWeight: activeList === 'income' ? 'bold' : 'normal'
                            }}>
                                {t('income')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor: activeList === 'expenditure'
                                        ? theme.colors.button
                                        : theme.dark ? '#1e1f22' : '#fff',
                                    borderColor: theme.colors.button,
                                    borderWidth: 1,
                                }
                            ]}
                            onPress={() => setActiveList('expenditure')}
                        >
                            <Text style={{
                                color: activeList === 'expenditure'
                                    ? theme.colors.text
                                    : theme.colors.button,
                                fontWeight: activeList === 'expenditure' ? 'bold' : 'normal'
                            }}>
                                {t('expenditure')}
                            </Text>
                        </TouchableOpacity>

                        <Button
                            mode="text"
                            style={[styles.addButton, { backgroundColor: theme.colors.button }]}
                            labelStyle={{ color: theme.colors.text }}
                            onPress={() => handleAddPress(activeList)}
                        >
                            +
                        </Button>
                    </View>
                ) : null}
                {!isPhone && (
                    <View style={styles.titlesContainer}>
                        <View style={styles.titleWithButton}>
                            <Text style={[styles.listTitle, { color: theme.colors.text }]}>{t('income')}</Text>
                            <Button
                                mode="contained"
                                style={[styles.addButton, { backgroundColor: theme.colors.button }]}
                                icon="plus"
                                labelStyle={{ color: theme.colors.text }}
                                onPress={() => handleAddPress('income')}
                            >
                                {t('addIncome')}
                            </Button>
                        </View>
                        <View style={styles.titleWithButton}>
                            <Text style={[styles.listTitle, { color: theme.colors.text }]}>{t('expenditure')}</Text>
                            <Button
                                mode="contained"
                                style={[styles.addButton, { backgroundColor: theme.colors.button }]}
                                icon="plus"
                                labelStyle={{ color: theme.colors.text }}
                                onPress={() => handleAddPress('expenditure')}
                            >
                                {t('addExpenditure')}
                            </Button>
                        </View>
                    </View>
                )}
                <View style={isPhone ? styles.singleListContainer : styles.listsContainer}>
                    {(!isPhone || activeList === 'income') && (
                        <View style={styles.listContainer}>
                            <TransactionList
                                transactions={incomeTransactions}
                                type="income"
                                currencySymbol={currencySymbol}
                                currencyIcon={currencyIcon}
                                onTransactionPress={handleTransactionPress}
                                theme={theme}
                            />
                        </View>
                    )}
                    {!isPhone && <Divider style={[styles.divider, { backgroundColor: theme.colors.surface }]} />}
                    {(!isPhone || activeList === 'expenditure') && (
                        <View style={styles.listContainer}>
                            <TransactionList
                                transactions={expenditureTransactions}
                                type="expenditure"
                                currencySymbol={currencySymbol}
                                currencyIcon={currencyIcon}
                                onTransactionPress={handleTransactionPress}
                                theme={theme}
                            />
                        </View>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listsContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    singleListContainer: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    divider: {
        width: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 8,
    },
    titlesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 4,
    },
    titleWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 8,
    },
    addButton: {
        marginLeft: 4,
        marginVertical: 0,
    },
});

export default QuarterScreen;
