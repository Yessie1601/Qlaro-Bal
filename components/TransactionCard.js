import React from 'react';
import { Card, Paragraph } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

const TransactionCard = ({
                             transaction,
                             currencySymbol,
                             onPress,
                             theme
                         }) => {
    const amount = transaction.amount ?? 0;
    const tax = transaction.tax ?? 0;
    const receipt = transaction.receipt_amount ?? 0;
    const taxValue = amount * tax / 100;

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#68291a', '#7d4d33']
                : ['#937f75', '#7d4d33']}
            style={{ marginVertical: 4, borderRadius: 8 }}
        >
            <Card
                style={{
                    backgroundColor: 'transparent',
                    borderRadius: 8,
                    elevation: 0,
                    shadowColor: 'transparent',
                    borderWidth: 0.5,
                    borderColor: '#7d4d33'
                }}
                onPress={onPress}
            >
                <Card.Content>
                    <Paragraph style={{ color: theme?.colors?.text ?? '#000' }}>
                        Amount: {currencySymbol}{amount.toFixed(2)}
                    </Paragraph>
                    <Paragraph style={{ color: theme?.colors?.text ?? '#000' }}>
                        Tax: {Math.round(tax)}%
                    </Paragraph>
                    <Paragraph style={{ color: theme?.colors?.text ?? '#000' }}>
                        Tax Value: {currencySymbol}{taxValue.toFixed(2)}
                    </Paragraph>
                    <Paragraph style={{ color: theme?.colors?.text ?? '#000' }}>
                        Receipt: {currencySymbol}{receipt.toFixed(2)}
                    </Paragraph>
                    <Paragraph style={{ color: theme?.colors?.text ?? '#000' }}>
                        Date: {moment(transaction.date).format('MMM D, YYYY')}
                    </Paragraph>
                </Card.Content>
            </Card>
        </LinearGradient>
    );
};

export default TransactionCard;


