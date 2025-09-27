import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import moment from 'moment';

const QuarterCard = ({quarter, startDate, income, expenditure, onPress, currencySymbol = '$'}) => {
    const formattedDate = moment(startDate).format('MMM D');
    const balance = income - expenditure;

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content>
                <Title>Q{quarter}</Title>
                <Paragraph>Starting: {formattedDate}</Paragraph>
                <View style={styles.row}>
                    <Paragraph>Income: {currencySymbol}{income.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.row}>
                    <Paragraph>Expenditure: {currencySymbol}{expenditure.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.row}>
                    <Paragraph style={{fontWeight: 'bold', color: balance >= 0 ? 'green' : 'red'}}>
                        Balance: {currencySymbol}{balance.toFixed(2)}
                    </Paragraph>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button onPress={onPress}>View Details</Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default QuarterCard;
