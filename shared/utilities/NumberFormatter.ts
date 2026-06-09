/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
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

const currenciesWithThreeDecimals = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];

const NumberFormatter = () => {
    const formatAmount = (currencyCode: string, amount: number): string => {
        let decimals = 2;
        if (currenciesWithNoDecimals.includes(currencyCode)) {
            decimals = 0;
        } else if (currenciesWithThreeDecimals.includes(currencyCode)) {
            decimals = 3;
        }

        const userLocale = navigator.languages?.length ? navigator.languages[0] : navigator.language;

        const numberFormatter = new Intl.NumberFormat(userLocale, {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        });

        return numberFormatter.format(decimals > 0 ? amount / Math.pow(10, decimals) : amount);
    };

    const formatAmountForGooglePay = (currencyCode: string, amount: number): string => {
        const formattedAmount = formatAmount(currencyCode, amount);

        return formattedAmount.replace(/,/g, '');
    };

    return { formatAmount, formatAmountForGooglePay };
};

export default NumberFormatter();
