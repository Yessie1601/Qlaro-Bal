import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Title, HelperText } from 'react-native-paper';
import moment from 'moment';

const AddTransactionModal = ({ visible, onDismiss, onSave, type, quarter }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [tax, setTax] = useState('');
    const [receiptAmount, setReceiptAmount] = useState('');
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!description.trim()) newErrors.description = 'Description is required';
        if (!amount || isNaN(parseFloat(amount))) newErrors.amount = 'Valid amount is required';
        if (!tax || isNaN(parseFloat(tax))) newErrors.tax = 'Valid tax amount is required';
        if (!receiptAmount || isNaN(parseFloat(receiptAmount))) newErrors.receiptAmount = 'Valid receipt amount is required';
        if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) newErrors.date = 'Valid date is required (YYYY-MM-DD)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave({
                quarter,
                type,
                description,
                amount: parseFloat(amount),
                tax: parseFloat(tax),
                receipt_amount: parseFloat(receiptAmount),
                date
            });
            resetForm();
        }
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setTax('');
        setReceiptAmount('');
        setDate(moment().format('YYYY-MM-DD'));
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

                    <TextInput
                        label="Date (YYYY-MM-DD)"
                        value={date}
                        onChangeText={setDate}
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        error={!!errors.date}
                    />
                    {errors.date && <HelperText type="error">{errors.date}</HelperText>}

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