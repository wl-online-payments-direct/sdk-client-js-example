// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

import FormField from '../../components/FormField.js';
import StorageService from '../../services/StorageService.js';
import Pages from '../../constants/pages.js';
import countries from '../../constants/countries.js';
import currencies from '../../constants/currencies.js';
import locales from '../../constants/locales.js';

import './index.css';

/**
 * The component that displays the form for entering payment details.
 *
 * @param {(details: sdk.PaymentContext) => void} onSetPaymentDetailsCallback
 * @returns {{mount: (mountingPoint: HTMLElement) => void}}
 * @constructor
 */
const PaymentDetails = (onSetPaymentDetailsCallback) => {
    /**
     * The component HTML.
     *
     * @type {string}
     */
    const template = `
        <p class="text-left">Order details:</p>
        <button class="button expand-button" type="button" id="paymentDetailsFormExpandButton">expand</button>
        <form class="form" id="paymentDetailsForm">
            ${FormField.getInputField('Amount (in the smallest denomination)', 'amount', 'number', true, { step: '1' }, '1000')}
            ${FormField.getSelectField('Country', 'countryCode', countries, true)}
            ${FormField.getSelectField('Currency', 'currencyCode', currencies, true)}
            ${FormField.getSelectField('Locale', 'locale', locales, true)}
            ${FormField.getCheckboxField('Is recurring payment?', 'isRecurring', false)}
            <button class="button primary" type="submit">Get payment methods</button>
            <div class="errorMessage" id="paymentDetailsErrorMessage"></div>
        </form>
    `;

    /**
     * Fetches the payment products based on the input values.
     *
     * @param {SubmitEvent} e
     */
    const fetchPaymentProducts = (e) => {
        /**  @type HTMLFormElement */
        const form = e.target;
        e.stopPropagation();
        e.preventDefault();
        form.classList.add('collapse');
        document.getElementById('paymentDetailsFormExpandButton').classList.add('show');

        const formData = new FormData(form);

        /** @type sdk.PaymentContext */
        const details = {
            amountOfMoney: {
                amount: Number(formData.get('amount')),
                currencyCode: formData.get('currencyCode')
            },
            countryCode: formData.get('countryCode'),
            isRecurring: formData.get('isRecurring') === 'on',
            locale: formData.get('locale')
        };

        StorageService.setPaymentContext(details);

        onSetPaymentDetailsCallback(details);
    };

    /**
     * Initializes the form and event handlers.
     */
    const init = () => {
        if (!StorageService.getSession()) {
            window.location = Pages.Home;
            return;
        }

        const form = document.getElementById('paymentDetailsForm');
        /** @type sdk.PaymentContext */
        const details = StorageService.getPaymentContext();
        if (details) {
            form.elements['amount'].value = details.amountOfMoney.amount.toString();
            form.elements['countryCode'].value = details.countryCode;
            form.elements['locale'].value = details.locale;
            form.elements['currencyCode'].value = details.amountOfMoney.currencyCode;
            form.elements['isRecurring'].checked = details.isRecurring;
        }

        form.addEventListener('submit', fetchPaymentProducts);
        const expandButton = document.getElementById('paymentDetailsFormExpandButton');
        expandButton.addEventListener('click', () => {
            expandButton.classList.remove('show');
            form.classList.remove('collapse');
        });
    };

    /**
     * Mounts the component to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        mountingPoint.innerHTML = template;
        init();
    };

    return { mount };
};

export default PaymentDetails;
