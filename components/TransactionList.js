import React from 'react';
import { FlatList } from 'react-native';
import TransactionCard from './TransactionCard';

const TransactionList = ({ transactions, type, currencySymbol, currencyIcon, onTransactionPress }) => (
    <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <TransactionCard
                transaction={item}
                type={type}
                currencySymbol={currencySymbol}
                currencyIcon={currencyIcon}
                compact={true}
                onPress={() => onTransactionPress && onTransactionPress(item)}
            />
        )}
    />
);

export default TransactionList;