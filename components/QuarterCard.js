import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import moment from 'moment';

const QuarterCard = ({ quarter, startDate, income, expenditure, onPress }) => {
    const formattedDate = moment(startDate).format('MMM D, YYYY');
    const balance = income - expenditure;

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content>
                <Title>Q{quarter}</Title>
                <Paragraph>Starting: {formattedDate}</Paragraph>
                <Paragraph>Income: ${income.toFixed(2)}</Paragraph>
                <Paragraph>Expenditure: ${expenditure.toFixed(2)}</Paragraph>
                <Paragraph style={{ fontWeight: 'bold', color: balance >= 0 ? 'green' : 'red' }}>
                    Balance: ${balance.toFixed(2)}
                </Paragraph>
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
});

export default QuarterCard;
