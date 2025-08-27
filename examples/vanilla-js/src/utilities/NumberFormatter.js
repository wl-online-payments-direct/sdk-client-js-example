/**
 * Currencies that don't have decimals.
 *
 * @type {string[]}
 */
const currenciesWithNoDecimals = [
    'BIF',
    'BYR',
    'CLF',
    'DJF',
    'GNF',
    'ISK',
    'JPY',
    'KMF',
    'KRW',
    'PYG',
    'RWF',
    'UGX',
    'UYI',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF'
];

/**
 * Currencies with three decimal spaces.
 *
 * @type {string[]}
 */
const currenciesWithThreeDecimals = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];

/**
 * Utility for number formatting.
 *
 * @returns {{formatAmount: (function({amount: number, currencyCode: string}): string)}}
 * @constructor
 */
const NumberFormatter = () => {
    /**
     * Formats the amount of money.
     *
     * @param {{amount: number, currencyCode: string}} money
     * @returns {string}
     */
    const formatAmount = (money) => {
        let decimals = 2;
        if (currenciesWithNoDecimals.includes(money.currencyCode)) {
            decimals = 0;
        } else if (currenciesWithThreeDecimals.includes(money.currencyCode)) {
            decimals = 3;
        }

        const userLocale = navigator.languages?.length ? navigator.languages[0] : navigator.language;

        const numberFormatter = new Intl.NumberFormat(userLocale, {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        });

        return numberFormatter.format(decimals > 0 ? money.amount / Math.pow(10, decimals) : money.amount);
    };

    return {
        formatAmount
    };
};

export default NumberFormatter();
