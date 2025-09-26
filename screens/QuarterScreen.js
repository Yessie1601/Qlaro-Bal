import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal';
import { getTransactions, addTransaction } from '../services/storageService';
import moment from 'moment';

const QuarterScreen = ({ navigation, route }) => {
    const { quarter, startDate } = route.params;
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [expenditureTransactions, setExpenditureTransactions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentType, setCurrentType] = useState('income');

    useEffect(() => {
        navigation.setOptions({
            title: `Quarter ${quarter} (${moment(startDate).format('MMM D, YYYY')})`
        });

        loadTransactions();
    }, [quarter, startDate]);

    const loadTransactions = async () => {
        try {
            const income = await getTransactions(quarter, 'income');
            const expenditures = await getTransactions(quarter, 'expenditure');
            setIncomeTransactions(income);
            setExpenditureTransactions(expenditures);
        } catch (error) {
            console.error('Error loading transactions:', error);
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

    return (
        <View style={styles.container}>
            <AddTransactionModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onSave={handleSaveTransaction}
                type={currentType}
                quarter={quarter}
            />

            <View style={styles.listsContainer}>
                <View style={styles.listContainer}>
                    <TransactionList
                        transactions={incomeTransactions}
                        type="income"
                        onAddPress={handleAddPress}
                    />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.listContainer}>
                    <TransactionList
                        transactions={expenditureTransactions}
                        type="expenditure"
                        onAddPress={handleAddPress}
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
