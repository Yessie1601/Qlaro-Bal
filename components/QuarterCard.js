import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { t } from '../i18n';

const QuarterCard = ({ quarter, startDate, income, expenditure, onPress, currencySymbol = '$', theme }) => {
    const formattedDate = moment(startDate).format('MMM D');
    const balance = income - expenditure;

    return (
        <LinearGradient
            colors={theme.dark
                ? ['#232428', '#2b2d31']
                : ['#f2f3f5', '#ffffff']}
            style={{ marginVertical: 20, borderRadius: 50 }}
        >
            <Card
                style={{
                    backgroundColor: 'transparent',
                    elevation: 0,
                    shadowColor: 'transparent',
                    borderRadius: 50,
                    borderWidth: 0.5,
                    borderColor: theme.dark ? '#5865F2' : '#d8dadf',
                }}
                onPress={onPress}
            >
                <Card.Content>
                    <Text style={{ color: theme.colors.text, padding: 2, fontSize: 20, fontWeight: 'bold' }}>
                        Q{quarter}
                    </Text>
                    <Text style={{ color: theme.colors.text, padding: 2 }}>
                        {t('starting')}: {formattedDate}
                    </Text>

                    <View style={styles.row}>
                        <Text style={{ color: theme.colors.text, padding: 2 }}>
                            {t('income')}: {currencySymbol}{income.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={{ color: theme.colors.text, padding: 2 }}>
                            {t('expenditure')}: {currencySymbol}{expenditure.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                color: balance >= 0 ? theme.colors.success : theme.colors.danger,
                                fontSize: 15,
                                padding: 2,
                            }}
                        >
                            {t('balance')}: {currencySymbol}{balance.toFixed(2)}
                        </Text>
                    </View>
                </Card.Content>

                <Card.Actions>
                    <Button
                        mode={'none'}
                        onPress={onPress}
                        labelStyle={{ color: theme.colors.accent }}
                    >
                        {t('viewDetails')}
                    </Button>
                </Card.Actions>
            </Card>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default QuarterCard;

