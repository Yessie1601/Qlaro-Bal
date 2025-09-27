import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Title, HelperText } from 'react-native-paper';
import moment from 'moment';

const AddTransactionModal = ({ visible, onDismiss, onSave, type, quarter, year }) => {
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

    const validateForm = () => {
        const newErrors = {};
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!amount || isNaN(parseFloat(amount))) newErrors.amount = 'Valid amount is required';
        if (!tax || isNaN(parseFloat(tax))) newErrors.tax = 'Valid tax amount is required';
        if (!receiptAmount || isNaN(parseFloat(receiptAmount))) newErrors.receiptAmount = 'Valid receipt amount is required';
        if (!month || !/^(0[1-9]|1[0-2])$/.test(month)) newErrors.month = 'Month must be 01-12';
        if (!day || !/^(0[1-9]|[12][0-9]|3[01])$/.test(day)) newErrors.day = 'Day must be 01-31';
        const dateStr = `${year}-${month}-${day}`;
        if (!moment(dateStr, 'YYYY-MM-DD', true).isValid()) newErrors.date = 'Invalid date';
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
                    <Title style={styles.title}>Add {type === 'income' ? 'Income' : 'Expenditure'}</Title>

                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        error={!!errors.description}
                    />
                    {errors.description && <HelperText type="error">{errors.description}</HelperText>}

                    <TextInput
                        label="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.amount}
                    />
                    {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

                    <TextInput
                        label="Tax"
                        value={tax}
                        onChangeText={setTax}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.tax}
                    />
                    {errors.tax && <HelperText type="error">{errors.tax}</HelperText>}

                    <TextInput
                        label="Receipt Amount"
                        value={receiptAmount}
                        onChangeText={setReceiptAmount}
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!errors.receiptAmount}
                    />
                    {errors.receiptAmount && <HelperText type="error">{errors.receiptAmount}</HelperText>}

                    <View style={styles.dateRow}>
                        <TextInput
                            label="Month (MM)"
                            value={month}
                            onChangeText={setMonth}
                            keyboardType="number-pad"
                            style={[styles.input, styles.dateInput]}
                            maxLength={2}
                            error={!!errors.month}
                        />
                        <TextInput
                            label="Day (DD)"
                            value={day}
                            onChangeText={setDay}
                            keyboardType="number-pad"
                            style={[styles.input, styles.dateInput]}
                            maxLength={2}
                            error={!!errors.day}
                        />
                        <View style={styles.yearBox}>
                            <Title style={styles.yearText}>{year}</Title>
                        </View>
                    </View>
                    {(errors.month || errors.day || errors.date) && (
                        <HelperText type="error">
                            {errors.month || errors.day || errors.date}
                        </HelperText>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button onPress={onCancel} style={styles.button}>Cancel</Button>
                        <Button mode="contained" onPress={handleSave} style={styles.button}>Save</Button>
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