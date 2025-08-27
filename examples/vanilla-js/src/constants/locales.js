const locales = [
    { value: 'ar_DZ', label: 'Arabic (ar_DZ)' },
    { value: 'zh_TW', label: 'Chinese (zh_TW)' },
    { value: 'da_DK', label: 'Danish (da_DK)' },
    { value: 'nl_BE', label: 'Dutch (nl_BE)' },
    { value: 'nl_NL', label: 'Dutch (nl_NL)' },
    { value: 'en_MT', label: 'English (en_MT)' },
    { value: 'en_GB', label: 'English (en_GB)', selected: true },
    { value: 'en_US', label: 'English (en_US)' },
    { value: 'fi_FI', label: 'Finnish (fi_FI)' },
    { value: 'fr_CH', label: 'French (fr_CH)' },
    { value: 'fr_BE', label: 'French (fr_BE)' },
    { value: 'de_DE', label: 'German (de_DE)' },
    { value: 'el_CY', label: 'Greek (el_CY)' },
    { value: 'in_ID', label: 'Indonesian (in_ID)' },
    { value: 'mk_MK', label: 'Macedonian (mk_MK)' }
].sort((a, b) => a.label.localeCompare(b.label));

export default locales;
