import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Appbar, Button, Card, Title, Paragraph } from 'react-native-paper';
import QuarterCard from '../components/QuarterCard';
import { initDatabase, getSettings, getTotals } from '../services/storageService';

const HomeScreen = ({ navigation }) => {
    const [settings, setSettings] = useState({
        year: new Date().getFullYear(),
        q1_start: '',
        q2_start: '',
        q3_start: '',
        q4_start: ''
    });
    const [totals, setTotals] = useState({
        1: { income: 0, expenditure: 0 },
        2: { income: 0, expenditure: 0 },
        3: { income: 0, expenditure: 0 },
        4: { income: 0, expenditure: 0 }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                const settingsData = await getSettings();
                setSettings(settingsData);

                const totalsData = await getTotals();
                const formattedTotals = {
                    1: { income: 0, expenditure: 0 },
                    2: { income: 0, expenditure: 0 },
                    3: { income: 0, expenditure: 0 },
                    4: { income: 0, expenditure: 0 }
                };

                totalsData.forEach(item => {
                    formattedTotals[item.quarter] = {
                        income: item.income_total || 0,
                        expenditure: item.expenditure_total || 0
                    };
                });

                setTotals(formattedTotals);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();

        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    const calculateYearlyTotals = () => {
        let totalIncome = 0;
        let totalExpenditure = 0;

        Object.values(totals).forEach(quarter => {
            totalIncome += quarter.income;
            totalExpenditure += quarter.expenditure;
        });

        return {
            income: totalIncome,
            expenditure: totalExpenditure,
            balance: totalIncome - totalExpenditure
        };
    };

    const yearlyTotals = calculateYearlyTotals();

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title={`Accounting ${settings.year}`} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <Title>Yearly Summary</Title>
                        <Paragraph>Income: ${yearlyTotals.income.toFixed(2)}</Paragraph>
                        <Paragraph>Expenditure: ${yearlyTotals.expenditure.toFixed(2)}</Paragraph>
                        <Paragraph style={{
                            fontWeight: 'bold',
                            color: yearlyTotals.balance >= 0 ? 'green' : 'red'
                        }}>
                            Balance: ${yearlyTotals.balance.toFixed(2)}
                        </Paragraph>
                    </Card.Content>
                </Card>

                <Title style={styles.sectionTitle}>Quarters</Title>

                <QuarterCard
                    quarter={1}
                    startDate={settings.q1_start}
                    income={totals[1].income}
                    expenditure={totals[1].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 1, startDate: settings.q1_start })}
                />

                <QuarterCard
                    quarter={2}
                    startDate={settings.q2_start}
                    income={totals[2].income}
                    expenditure={totals[2].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 2, startDate: settings.q2_start })}
                />

                <QuarterCard
                    quarter={3}
                    startDate={settings.q3_start}
                    income={totals[3].income}
                    expenditure={totals[3].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 3, startDate: settings.q3_start })}
                />

                <QuarterCard
                    quarter={4}
                    startDate={settings.q4_start}
                    income={totals[4].income}
                    expenditure={totals[4].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 4, startDate: settings.q4_start })}
                />

                <Button
                    mode="contained"
                    icon="cog"
                    onPress={() => navigation.navigate('Settings')}
                    style={styles.settingsButton}
                >
                    Settings
                </Button>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
    },
    summaryCard: {
        marginBottom: 16,
        elevation: 4,
    },
    sectionTitle: {
        marginVertical: 8,
    },
    settingsButton: {
        marginTop: 24,
        marginBottom: 16,
    },
});

export default HomeScreen;
