import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { List, Divider, Text, FAB } from 'react-native-paper';
import moment from 'moment';

const TransactionList = ({ transactions, type, onAddPress }) => {
    const renderItem = ({ item }) => (
        <List.Item
            title={item.description}
            description={`Date: ${moment(item.date).format('MMM D, YYYY')}`}
            right={() => (
                <View style={styles.amountsContainer}>
                    <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                    <Text style={styles.taxInfo}>Tax: ${item.tax.toFixed(2)}</Text>
                    <Text style={styles.receiptInfo}>Receipt: ${item.receipt_amount.toFixed(2)}</Text>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{type === 'income' ? 'Income' : 'Expenditures'}</Text>
            </View>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text>No {type === 'income' ? 'income' : 'expenditures'} recorded</Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider />}
                    style={styles.list}
                />
            )}

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => onAddPress(type)}
                color="white"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        flex: 1,
    },
    amountsContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    taxInfo: {
        fontSize: 12,
        color: 'gray',
    },
    receiptInfo: {
        fontSize: 12,
        color: 'gray',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2196F3',
    },
});

export default TransactionList;
