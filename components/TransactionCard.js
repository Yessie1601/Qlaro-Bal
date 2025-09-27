import React from 'react';
import { Card, Paragraph } from 'react-native-paper';
import moment from 'moment';

const TransactionCard = ({ transaction, currencySymbol, onPress }) => (
    <Card style={{ marginVertical: 4 }} onPress={onPress}>
        <Card.Content>
            <Paragraph>Amount: {currencySymbol}{transaction.amount.toFixed(2)}</Paragraph>
            <Paragraph>Tax: {transaction.tax.toFixed(2)}%</Paragraph>
            <Paragraph>Date: {moment(transaction.date).format('MMM D, YYYY')}</Paragraph>
        </Card.Content>
    </Card>
);

export default TransactionCard;
