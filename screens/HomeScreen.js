import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import QuarterCard from '../components/QuarterCard';
import { getCurrency, getSettings, getTotals, initDatabase } from '../services/storageService';
import { LinearGradient } from 'expo-linear-gradient';

const currencyOptions = [
    { label: 'USD', symbol: '$', icon: 'currency-usd' },
    { label: 'EUR', symbol: '€', icon: 'currency-eur' },
    { label: 'GBP', symbol: '£', icon: 'currency-gbp' },
    { label: 'JPY', symbol: '¥', icon: 'currency-jpy' },
    { label: 'INR', symbol: '₹', icon: 'currency-inr' },
];

const HomeScreen = ({ navigation, route }) => {
    const { theme } = route.params;
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
    const scrollViewRef = useRef();

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

        if (navigation) {
            return navigation.addListener('focus', loadData);
        }
    }, [navigation, selectedYear]);

    useEffect(() => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                const yearIndex = yearOptions.indexOf(selectedYear);
                const buttonWidth = 80;
                const screenWidth = Dimensions.get('window').width;
                const offset = yearIndex * buttonWidth - (screenWidth / 2) + (buttonWidth / 2);
                scrollViewRef.current.scrollTo({ x: Math.max(offset, 0), animated: true });
            }
        }, 100);
    }, [selectedYear]);

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
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#d8dadf']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1 }}>
                <LinearGradient
                    colors={theme.dark
                        ? ['#232428', '#2b2d31', '#1e1f22']
                        : ['#ffffff', '#f2f3f5', '#e3e5e8']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.yearSummary}
                >
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, padding: 2 }}>
                            Income: {currencySymbol}{yearlyTotals.income.toFixed(2)}
                        </Text>
                        <Text style={{ color: theme.colors.text, fontSize: 20, padding: 2 }}>
                            Expenditure: {currencySymbol}{yearlyTotals.expenditure.toFixed(2)}
                        </Text>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 24,
                                color: yearlyTotals.balance >= 0 ? theme.colors.success : theme.colors.danger,
                                padding: 2,
                            }}
                        >
                            Balance: {currencySymbol}{yearlyTotals.balance.toFixed(2)}
                        </Text>

                        <View style={styles.yearSelectorContainer}>
                            <ScrollView
                                ref={scrollViewRef}
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
                                                ? { backgroundColor: theme.colors.button }
                                                : { backgroundColor: theme.colors.surface },
                                        ]}
                                        onPress={() => handleYearSelect(year)}
                                    >
                                        <Text
                                            style={[
                                                styles.yearText,
                                                selectedYear === year
                                                    ? { color: '#fff', fontWeight: 'bold' }
                                                    : { color: theme.colors.text },
                                            ]}
                                        >
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    <View style={styles.container}>
                        <QuarterCard
                            quarter={1}
                            startDate={`${selectedYear}-${settings.q1_start}`}
                            income={totals[1].income}
                            expenditure={totals[1].expenditure}
                            onPress={() =>
                                navigation.navigate('Quarter', {
                                    quarter: 1,
                                    startDate: settings.q1_start,
                                    year: selectedYear,
                                    theme,
                                })
                            }
                            currencySymbol={currencySymbol}
                            currencyIcon={currencyIcon}
                            theme={theme}
                        />
                        <QuarterCard
                            quarter={2}
                            startDate={`${selectedYear}-${settings.q2_start}`}
                            income={totals[2].income}
                            expenditure={totals[2].expenditure}
                            onPress={() =>
                                navigation.navigate('Quarter', {
                                    quarter: 2,
                                    startDate: settings.q2_start,
                                    year: selectedYear,
                                    theme,
                                })
                            }
                            currencySymbol={currencySymbol}
                            currencyIcon={currencyIcon}
                            theme={theme}
                        />
                        <QuarterCard
                            quarter={3}
                            startDate={`${selectedYear}-${settings.q3_start}`}
                            income={totals[3].income}
                            expenditure={totals[3].expenditure}
                            onPress={() =>
                                navigation.navigate('Quarter', {
                                    quarter: 3,
                                    startDate: settings.q3_start,
                                    year: selectedYear,
                                    theme,
                                })
                            }
                            currencySymbol={currencySymbol}
                            currencyIcon={currencyIcon}
                            theme={theme}
                        />
                        <QuarterCard
                            quarter={4}
                            startDate={`${selectedYear}-${settings.q4_start}`}
                            income={totals[4].income}
                            expenditure={totals[4].expenditure}
                            onPress={() =>
                                navigation.navigate('Quarter', {
                                    quarter: 4,
                                    startDate: settings.q4_start,
                                    year: selectedYear,
                                    theme,
                                })
                            }
                            currencySymbol={currencySymbol}
                            currencyIcon={currencyIcon}
                            theme={theme}
                        />

                        <Button
                            mode="contained"
                            icon="cog"
                            onPress={() => navigation.navigate('Settings', { theme })}
                            style={[styles.settingsButton, { backgroundColor: theme.colors.button }]}
                            labelStyle={{ color: '#fff' }}
                        >
                            Settings
                        </Button>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    yearSummary: {
        overflow: 'hidden',
        paddingBottom: 15,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    yearSelectorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 10,
        marginTop: 8,
    },
    yearSelector: {
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
        borderWidth: 0.1,
    },
    yearText: {
        fontSize: 20,
    },
    scrollContent: {
        padding: 16,
    },
    sectionTitle: {
        marginVertical: 10,
    },
    settingsButton: {
        marginTop: 24,
        marginBottom: 16,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default HomeScreen;
