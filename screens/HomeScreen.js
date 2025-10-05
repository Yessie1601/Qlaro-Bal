import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import QuarterCard from '../components/QuarterCard';
import { getCurrency, getSettings, initDatabase, getTransactions } from '../services/storageService';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../i18n';

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
    const [currency, setCurrency] = useState('USD');
    const [quarterWithTax, setQuarterWithTax] = useState({
        1: { incomeTotalWithTax: 0, expenditureTotalWithTax: 0 },
        2: { incomeTotalWithTax: 0, expenditureTotalWithTax: 0 },
        3: { incomeTotalWithTax: 0, expenditureTotalWithTax: 0 },
        4: { incomeTotalWithTax: 0, expenditureTotalWithTax: 0 }
    });
    const scrollViewRef = useRef();

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                const settingsData = await getSettings();
                setSettings(settingsData);

                // Calculate total with tax for each quarter
                const taxTotals = {};
                for (let q = 1; q <= 4; q++) {
                    const incomeTx = await getTransactions(q, 'income', selectedYear);
                    const expenditureTx = await getTransactions(q, 'expenditure', selectedYear);

                    const incomeTotalWithTax = incomeTx.reduce(
                        (sum, t) => sum + t.amount + (t.amount * (t.tax ?? 0) / 100), 0
                    );
                    const expenditureTotalWithTax = expenditureTx.reduce(
                        (sum, t) => sum + t.amount + (t.amount * (t.tax ?? 0) / 100), 0
                    );
                    taxTotals[q] = { incomeTotalWithTax, expenditureTotalWithTax };
                }
                setQuarterWithTax(taxTotals);

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

    // Calculate yearly totals with tax
    const calculateYearlyTotalsWithTax = () => {
        let totalIncomeWithTax = 0;
        let totalExpenditureWithTax = 0;

        Object.values(quarterWithTax).forEach(q => {
            totalIncomeWithTax += q.incomeTotalWithTax || 0;
            totalExpenditureWithTax += q.expenditureTotalWithTax || 0;
        });

        return {
            incomeTotalWithTax: totalIncomeWithTax,
            expenditureTotalWithTax: totalExpenditureWithTax,
            balance: totalIncomeWithTax - totalExpenditureWithTax
        };
    };

    const currencyObj = currencyOptions.find(c => c.label === currency) || currencyOptions[0];
    const currencySymbol = currencyObj.symbol;
    const currencyIcon = currencyObj.icon;
    const yearlyTotalsWithTax = calculateYearlyTotalsWithTax();

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
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', padding: 2 }}>
                            {t('income')}: {currencySymbol}{yearlyTotalsWithTax.incomeTotalWithTax.toFixed(2)}
                        </Text>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', padding: 2 }}>
                            {t('expenditure')}: {currencySymbol}{yearlyTotalsWithTax.expenditureTotalWithTax.toFixed(2)}
                        </Text>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 24,
                                color: yearlyTotalsWithTax.balance >= 0 ? theme.colors.success : theme.colors.danger,
                                padding: 2,
                            }}
                        >
                            {t('balance')}: {currencySymbol}{yearlyTotalsWithTax.balance.toFixed(2)}
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
                        {[1, 2, 3, 4].map(q => (
                            <QuarterCard
                                key={q}
                                quarter={q}
                                startDate={`${selectedYear}-${settings[`q${q}_start`]}`}
                                incomeTotalWithTax={quarterWithTax[q]?.incomeTotalWithTax || 0}
                                expenditureTotalWithTax={quarterWithTax[q]?.expenditureTotalWithTax || 0}
                                onPress={() =>
                                    navigation.navigate('Quarter', {
                                        quarter: q,
                                        startDate: settings[`q${q}_start`],
                                        year: selectedYear,
                                        theme,
                                    })
                                }
                                currencySymbol={currencySymbol}
                                currencyIcon={currencyIcon}
                                theme={theme}
                            />
                        ))}

                        <Button
                            mode="contained"
                            icon="cog"
                            onPress={() => navigation.navigate('Settings', { theme })}
                            style={[styles.settingsButton, { backgroundColor: theme.colors.button }]}
                            labelStyle={{ color: '#fff' }}
                        >
                            {t('settings')}
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
        paddingTop: 10,
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
