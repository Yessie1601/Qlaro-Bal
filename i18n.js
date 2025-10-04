import en from './locales/en';
import fr from './locales/fr';
import nl from './locales/nl';

const supportedLanguages = [
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    { label: 'Nederlands', value: 'nl' }
];

const translations = {
    en,
    fr,
    nl
};

let currentLanguage = 'en';

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
    }
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

export { supportedLanguages };
