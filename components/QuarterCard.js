import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import moment from 'moment';

const QuarterCard = ({quarter, startDate, income, expenditure, onPress, currencySymbol = '$', theme}) => {
    const formattedDate = moment(startDate).format('MMM D');
    const balance = income - expenditure;

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
            <Card.Content>
                <Title style={{ color: theme.colors.text }}>Q{quarter}</Title>
                <Paragraph style={{ color: theme.colors.text }}>Starting: {formattedDate}</Paragraph>
                <View style={styles.row}>
                    <Paragraph style={{ color: theme.colors.text }}>Income: {currencySymbol}{income.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.row}>
                    <Paragraph style={{ color: theme.colors.text }}>Expenditure: {currencySymbol}{expenditure.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.row}>
                    <Paragraph style={{
                        fontWeight: 'bold',
                        color: balance >= 0 ? 'green' : 'red',
                        fontSize: 15
                    }}>
                        Balance: {currencySymbol}{balance.toFixed(2)}
                    </Paragraph>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button
                    onPress={onPress}
                    style={{ backgroundColor: theme.colors.button }}
                    labelStyle={{ color: theme.colors.text }}
                >
                    View Details
                </Button>
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
