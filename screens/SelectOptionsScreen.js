import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { t } from '../i18n';
import { setLanguage as persistLanguage } from '../i18n';
import { setCurrency as persistCurrency } from '../services/storageService';

const languages = [
    { label: 'English', value: 'en' },
    { label: 'Nederlands', value: 'nl' },
    { label: 'Français', value: 'fr' },
];

const currencies = [
    { label: 'USD', symbol: '$', value: 'USD' },
    { label: 'EUR', symbol: '€', value: 'EUR' },
    { label: 'GBP', symbol: '£', value: 'GBP' },
    { label: 'JPY', symbol: '¥', value: 'JPY' },
    { label: 'INR', symbol: '₹', value: 'INR' },
];

const SelectOptionsScreen = ({ navigation, theme, language, setLanguage, currency, setCurrency }) => {
    return (
        <LinearGradient
            colors={theme.dark
                ? ['#1e1f22', '#2b2d31', '#232428']
                : ['#f2f3f5', '#e3e5e8', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Text style={styles.title}>Select Language & Currency</Text>
                <View style={styles.selectRow}>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={language}
                            onValueChange={async (lang) => {
                                setLanguage(lang);
                                await persistLanguage(lang);
                            }}
                            style={{ color: theme.colors.text }}
                            dropdownIconColor={theme.colors.button}
                        >
                            {languages.map(lang => (
                                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={currency}
                            onValueChange={async (curr) => {
                                setCurrency(curr);
                                await persistCurrency(curr);
                            }}
                            style={{ color: theme.colors.text }}
                            dropdownIconColor={theme.colors.button}
                        >
                            {currencies.map(curr => (
                                <Picker.Item
                                    key={curr.value}
                                    label={`${curr.label} (${curr.symbol})`}
                                    value={curr.value}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
                <Button
                    mode="contained"
                    style={{ backgroundColor: theme.colors.button, marginTop: 16 }}
                    labelStyle={{ color: theme.colors.text }}
                    onPress={() => navigation.replace('Home', { theme })}
                >
                    {t('getStarted')}
                </Button>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        color: '#5865F2',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    selectRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    pickerWrapper: {
        marginHorizontal: 8,
        minWidth: 150,
        borderWidth: 1,
        borderColor: '#5865F2',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default SelectOptionsScreen;

