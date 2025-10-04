import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, HelperText, Modal, Portal, TextInput} from 'react-native-paper';
import moment from 'moment';
import {t} from '../i18n';
import { Text } from 'react-native-paper';

const AddTransactionModal = ({visible, onDismiss, onSave, type, quarter, year}) => {
    const today = moment();
    const initialMonth = today.format('MM');
    const initialDay = today.format('DD');

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [tax, setTax] = useState('');
    const [receiptAmount, setReceiptAmount] = useState('');
    const [month, setMonth] = useState(initialMonth);
    const [day, setDay] = useState(initialDay);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (visible) {
            setMonth(initialMonth);
            setDay(initialDay);
        }
    }, [year, visible]);

    useEffect(() => {
        const amt = parseFloat(amount);
        const tx = parseFloat(tax);
        if (!isNaN(amt) && !isNaN(tx)) {
            setReceiptAmount((amt + (amt * tx / 100)).toFixed(2));
        } else {
            setReceiptAmount('');
        }
    }, [amount, tax]);

    const validateForm = () => {
        const newErrors = {};
        if (!description.trim()) newErrors.description = t('description') + ' ' + t('isRequired');
        if (!amount || isNaN(parseFloat(amount))) newErrors.amount = t('amount') + ' ' + t('isRequired');
        if (!tax || isNaN(parseFloat(tax))) newErrors.tax = t('tax') + ' ' + t('isRequired');
        if (!receiptAmount || isNaN(parseFloat(receiptAmount))) newErrors.receiptAmount = t('receiptAmount') + ' ' + t('isRequired');
        if (!month || !/^(0[1-9]|1[0-2])$/.test(month)) newErrors.month = t('month') + ' 01-12';
        if (!day || !/^(0[1-9]|[12][0-9]|3[01])$/.test(day)) newErrors.day = t('day') + ' 01-31';
        const dateStr = `${year}-${month}-${day}`;
        if (!moment(dateStr, 'YYYY-MM-DD', true).isValid()) newErrors.date = t('date') + ' ' + t('isInvalid');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            const dateStr = `${year}-${month}-${day}`;
            onSave({
                quarter,
                type,
                description,
                amount: parseFloat(amount),
                tax: parseFloat(tax),
                receipt_amount: parseFloat(receiptAmount),
                date: dateStr,
                year
            });
            resetForm();
        }
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setTax('');
        setReceiptAmount('');
        setMonth(initialMonth);
        setDay(initialDay);
        setErrors({});
    };

    const onCancel = () => {
        resetForm();
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onCancel} contentContainerStyle={styles.container}>
                <ScrollView>
                    <Text variant="titleLarge" style={styles.title}>
                        {type === 'income' ? t('addIncome') : t('addExpenditure')}
                    </Text>

                    <View style={styles.dateRow}>
                        <TextInput
                            label={t('month')}
                            value={month}
                            onChangeText={setMonth}
                            keyboardType="number-pad"
                            style={[styles.input, styles.dateInput]}
                            maxLength={2}
                            error={!!errors.month}
                        />
                        <TextInput
                            label={t('day')}
                            value={day}
                            onChangeText={setDay}
                            keyboardType="number-pad"
                            style={[styles.input, styles.dateInput]}
                            maxLength={2}
                            error={!!errors.day}
                        />
                        <View style={styles.yearBox}>
                            <Text style={styles.yearText}>{year}</Text>
                        </View>
                    </View>
                    {(errors.month || errors.day || errors.date) && (
                        <HelperText type="error">
                            {errors.month || errors.day || errors.date}
                        </HelperText>
                    )}

                    <TextInput
                        label={t('amount')}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.amount}
                    />
                    {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

                    <TextInput
                        label={t('tax') + ' (%)'}
                        value={tax}
                        onChangeText={setTax}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.tax}
                    />
                    {errors.tax && <HelperText type="error">{errors.tax}</HelperText>}

                    <TextInput
                        label={t('receiptAmount')}
                        value={receiptAmount}
                        onChangeText={setReceiptAmount}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.receiptAmount}
                    />
                    {errors.receiptAmount && <HelperText type="error">{errors.receiptAmount}</HelperText>}

                    <TextInput
                        label={t('description')}
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        error={!!errors.description}
                    />
                    {errors.description && <HelperText type="error">{errors.description}</HelperText>}

                    <View style={styles.buttonContainer}>
                        <Button onPress={onCancel} style={styles.button}>{t('cancel')}</Button>
                        <Button mode="contained" onPress={handleSave} style={styles.button}>{t('save')}</Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    title: {
        marginBottom: 16,
    },
    input: {
        marginVertical: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dateInput: {
        flex: 1,
        marginRight: 8,
    },
    yearBox: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#eee',
        borderRadius: 6,
        height: 56,
    },
    yearText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    button: {
        marginLeft: 8,
    },
});

export default AddTransactionModal;
