import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {TextInput, Button, Divider, Snackbar, Title} from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import { getSettings, updateSettings, exportData } from '../services/storageService';
import moment from 'moment';

const SettingsScreen = () => {
    const [year, setYear] = useState('');
    const [q1Start, setQ1Start] = useState('');
    const [q2Start, setQ2Start] = useState('');
    const [q3Start, setQ3Start] = useState('');
    const [q4Start, setQ4Start] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            setYear(settings.year.toString());
            setQ1Start(settings.q1_start);
            setQ2Start(settings.q2_start);
            setQ3Start(settings.q3_start);
            setQ4Start(settings.q4_start);
        } catch (error) {
            console.error('Error loading settings:', error);
            showSnackbar('Error loading settings');
        }
    };

    const handleSaveSettings = async () => {
        try {
            if (!validateSettings()) {
                showSnackbar('Please enter valid dates (YYYY-MM-DD)');
                return;
            }

            await updateSettings(
                parseInt(year, 10),
                q1Start,
                q2Start,
                q3Start,
                q4Start
            );

            showSnackbar('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            showSnackbar('Error saving settings');
        }
    };

    const validateSettings = () => {
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            return false;
        }

        const dateFormat = 'YYYY-MM-DD';
        return !(!moment(q1Start, dateFormat, true).isValid() ||
            !moment(q2Start, dateFormat, true).isValid() ||
            !moment(q3Start, dateFormat, true).isValid() ||
            !moment(q4Start, dateFormat, true).isValid());


    };

    const handleExportData = async () => {
        try {
            const fileUri = await exportData();
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('Export error:', error);
            showSnackbar('Error exporting data');
        }
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.sectionTitle}>Quarter Dates</Title>

            <TextInput
                label="Year"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                label="Q1 Start Date (YYYY-MM-DD)"
                value={q1Start}
                onChangeText={setQ1Start}
                style={styles.input}
            />

            <TextInput
                label="Q2 Start Date (YYYY-MM-DD)"
                value={q2Start}
                onChangeText={setQ2Start}
                style={styles.input}
            />

            <TextInput
                label="Q3 Start Date (YYYY-MM-DD)"
                value={q3Start}
                onChangeText={setQ3Start}
                style={styles.input}
            />

            <TextInput
                label="Q4 Start Date (YYYY-MM-DD)"
                value={q4Start}
                onChangeText={setQ4Start}
                style={styles.input}
            />

            <Button
                mode="contained"
                onPress={handleSaveSettings}
                style={styles.button}
            >
                Save Settings
            </Button>

            <Divider style={styles.divider} />

            <Title style={styles.sectionTitle}>Data Management</Title>

            <Button
                mode="contained"
                icon="export"
                onPress={handleExportData}
                style={styles.button}
            >
                Export Data
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
        marginVertical: 16,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    button: {
        marginVertical: 8,
    },
    divider: {
        marginVertical: 24,
    },
});

export default SettingsScreen;
