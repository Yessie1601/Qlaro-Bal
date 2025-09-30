import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

const QuarterCard = ({ quarter, startDate, income, expenditure, onPress, currencySymbol = '$', theme }) => {
    const formattedDate = moment(startDate).format('MMM D');
    const balance = income - expenditure;

    return (
        <LinearGradient
            colors={theme.dark ? ['#68291a', '#4D301B'] : ['#d2bfa6','#937f75' ]}
            style={{ marginVertical: 15, borderRadius: 8 }}
        >
            <Card style={{ backgroundColor: 'transparent', borderRadius: 8 , elevation: 0, shadowColor: 'transparent', borderWidth: 0.5, borderColor: '#7d4d33'}} onPress={onPress}>
                <Card.Content>
                    <Title style={{ color: theme.colors.text, padding: 5}}>Q{quarter}</Title>
                    <Paragraph style={{ color: theme.colors.text, padding: 5}}>Starting: {formattedDate}</Paragraph>
                    <View style={styles.row}>
                        <Paragraph style={{ color: theme.colors.text, padding: 5 }}>Income: {currencySymbol}{income.toFixed(2)}</Paragraph>
                    </View>
                    <View style={styles.row}>
                        <Paragraph style={{ color: theme.colors.text, padding: 5}}>Expenditure: {currencySymbol}{expenditure.toFixed(2)}</Paragraph>
                    </View>
                    <View style={styles.row}>
                        <Paragraph style={{
                            fontWeight: 'bold',
                            color: balance >= 0 ? 'green' : 'red',
                            fontSize: 15,
                            padding: 5
                        }}>
                            Balance: {currencySymbol}{balance.toFixed(2)}
                        </Paragraph>
                    </View>
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode={'none'}
                        onPress={onPress}
                        labelStyle={{ color: theme.colors.text }}
                    >
                        View Details
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
