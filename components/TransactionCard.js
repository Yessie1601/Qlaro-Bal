import React from 'react';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';
import moment from 'moment';
import { t } from '../i18n';

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
                ? ['#232428', '#2b2d31']
                : ['#f2f3f5', '#ffffff']}
            style={{ marginVertical: 4, borderRadius: 8 }}
        >
            <Card
                style={{
                    backgroundColor: 'transparent',
                    borderRadius: 8,
                    elevation: 0,
                    shadowColor: 'transparent',
                    borderWidth: 0.5,
                    borderColor: theme.dark ? '#5865F2' : '#d8dadf'
                }}
                onPress={onPress}
            >
                <Card.Content>
                    <Text style={{ color: theme?.colors?.text ?? '#000' }}>
                        {t('amount')}: {currencySymbol}{amount.toFixed(2)}
                    </Text>
                    <Text style={{ color: theme?.colors?.text ?? '#000' }}>
                        {t('tax')}: {Math.round(tax)}%
                    </Text>
                    <Text style={{ color: theme?.colors?.text ?? '#000' }}>
                        {t('taxValue')}: {currencySymbol}{taxValue.toFixed(2)}
                    </Text>
                    <Text style={{ color: theme?.colors?.text ?? '#000' }}>
                        {t('receipt')}: {currencySymbol}{receipt.toFixed(2)}
                    </Text>
                    <Text style={{ color: theme?.colors?.text ?? '#000' }}>
                        {t('date')}: {moment(transaction.date).format('MMM D, YYYY')}
                    </Text>
                </Card.Content>
            </Card>
        </LinearGradient>
    );
};

export default TransactionCard;
