import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Button, Card, Paragraph, Title} from 'react-native-paper';
import QuarterCard from '../components/QuarterCard';
import {getCurrency, getSettings, getTotals, initDatabase} from '../services/storageService';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const HomeScreen = ({ navigation, theme }) => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

    const [settings, setSettings] = useState({
        year: currentYear,
        q1_start: '',
        q2_start: '',
        q3_start: '',
        q4_start: ''
    });
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [totals, setTotals] = useState({
        1: { income: 0, expenditure: 0 },
        2: { income: 0, expenditure: 0 },
        3: { income: 0, expenditure: 0 },
        4: { income: 0, expenditure: 0 }
    });
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                const settingsData = await getSettings();
                setSettings(settingsData);
                const totalsData = await getTotals(selectedYear);
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

                const curr = await getCurrency();
                setCurrency(curr);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();

        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation, selectedYear]);

    const handleYearSelect = (year) => {
        setSelectedYear(year);
    };

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

    const currencyObj = currencyOptions.find(c => c.label === currency) || currencyOptions[0];
    const currencySymbol = currencyObj.symbol;
    const currencyIcon = currencyObj.icon;
    const yearlyTotals = calculateYearlyTotals();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.yearSelectorContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.yearSelector}
                >
                    {yearOptions.map(year => (
                        <TouchableOpacity
                            key={year}
                            style={[
                                styles.yearButton,
                                selectedYear === year
                                    ? { backgroundColor: theme.colors.button, borderColor: theme.colors.button }
                                    : { backgroundColor: '#fff', borderColor: theme.colors.button }
                            ]}
                            onPress={() => handleYearSelect(year)}
                        >
                            <Text style={[
                                styles.yearText,
                                selectedYear === year
                                    ? { color: '#fff', fontWeight: 'bold' }
                                    : { color: theme.colors.button }
                            ]}>
                                {year}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.text }}>Yearly Summary</Title>
                        <Paragraph style={{ color: theme.colors.text }}>Income: {currencySymbol}{yearlyTotals.income.toFixed(2)}</Paragraph>
                        <Paragraph style={{ color: theme.colors.text }}>Expenditure: {currencySymbol}{yearlyTotals.expenditure.toFixed(2)}</Paragraph>
                        <Paragraph style={{
                            fontWeight: 'bold',
                            color: yearlyTotals.balance >= 0 ? 'green' : 'red'
                        }}>
                            Balance: {currencySymbol}{yearlyTotals.balance.toFixed(2)}
                        </Paragraph>
                    </Card.Content>
                </Card>
                <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>Quarters</Title>
                <QuarterCard
                    quarter={1}
                    startDate={`${selectedYear}-${settings.q1_start}`}
                    income={totals[1].income}
                    expenditure={totals[1].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 1, startDate: settings.q1_start, year: selectedYear, theme })}
                    currencySymbol={currencySymbol}
                    currencyIcon={currencyIcon}
                    theme={theme}
                />
                <QuarterCard
                    quarter={2}
                    startDate={`${selectedYear}-${settings.q2_start}`}
                    income={totals[2].income}
                    expenditure={totals[2].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 2, startDate: settings.q2_start, year: selectedYear, theme })}
                    currencySymbol={currencySymbol}
                    currencyIcon={currencyIcon}
                    theme={theme}
                />
                <QuarterCard
                    quarter={3}
                    startDate={`${selectedYear}-${settings.q3_start}`}
                    income={totals[3].income}
                    expenditure={totals[3].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 3, startDate: settings.q3_start, year: selectedYear, theme })}
                    currencySymbol={currencySymbol}
                    currencyIcon={currencyIcon}
                    theme={theme}
                />
                <QuarterCard
                    quarter={4}
                    startDate={`${selectedYear}-${settings.q4_start}`}
                    income={totals[4].income}
                    expenditure={totals[4].expenditure}
                    onPress={() => navigation.navigate('Quarter', { quarter: 4, startDate: settings.q4_start, year: selectedYear, theme })}
                    currencySymbol={currencySymbol}
                    currencyIcon={currencyIcon}
                    theme={theme}
                />
                <Button
                    mode="contained"
                    icon="cog"
                    onPress={() => navigation.navigate('Settings')}
                    style={[styles.settingsButton, { backgroundColor: theme.colors.button }]}
                    labelStyle={{ color: theme.colors.text }}
                >
                    Settings
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        paddingBottom: 40,
    },
    yearSelector:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    yearButton: {
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        marginHorizontal: 4,
        borderWidth: 2,
    },
    yearText: {
        fontSize: 20,
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
    yearSelectorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 10
    },
});

export default HomeScreen;

