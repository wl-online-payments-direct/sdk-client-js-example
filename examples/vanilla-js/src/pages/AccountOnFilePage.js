// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

import Logo from '../components/Logo.js';
import StorageService from '../services/StorageService.js';
import Pages from '../constants/pages.js';
import FormField from '../components/FormField.js';
import Loader from '../components/Loader.js';
import NumberFormatter from '../utilities/NumberFormatter.js';
import PaymentRequestUtility from '../utilities/PaymentRequestUtility.js';
import PaymentProductService from '@javascript-sdk-example/shared/services/PaymentProductService';

/**
 * The "account on file" page.
 * Renders a page for entering cvv with prefilled values from a selected account on file.
 *
 * @returns {{mount: ((function(HTMLElement): Promise<void>)|*)}}
 * @constructor
 */
const AccountOnFilePage = () => {
    /** @type sdk.PaymentProduct */
    let paymentProduct;

    /** @type HTMLFormElement */
    let form;

    /** @type sdk.OnlinePaymentSdk */
    let sdkClient;

    let accountOnFile;

    /**
     * Returns the page HTML.
     *
     * @param {sdk.PaymentContextWithAmount} paymentDetails
     * @returns {string}
     */
    const getTemplate = (paymentDetails) => {
        let paymentRequest;
        if (accountOnFile) {
            paymentRequest = PaymentRequestUtility.get(
                paymentProduct,
                'expiryDate',
                accountOnFile.attributeByKey['expiryDate'].value
            );
        }

        return `
            <div class="page flex column center">
                ${Logo.render()}
                <h1 class="m-0">Pay with a credit card</h1>
                <p class="self-start m-0"><strong>Total amount: ${NumberFormatter.formatAmount(paymentDetails.amountOfMoney)} ${paymentDetails.amountOfMoney.currencyCode}</strong></p>
                <p class="self-start m-0">Selected card type: ${paymentProduct?.label}</p>
                <a href="${Pages.Payment}" class="button link self-start">← Back to payment method selection</a>
                <form class="form" id="creditCardForm">
                    ${FormField.getInputField('Card number', 'cardNumber', 'text', true, {}, accountOnFile.label ?? '', true)}
                    <div class="flex row">
                        ${FormField.getInputField('Expiry date', 'expiryDate', 'text', true, {}, paymentRequest ? paymentRequest.getField('expiryDate').getMaskedValue() : '', true)}
                        ${paymentProduct?.fields.find((f) => f.id === 'cvv') ? FormField.getInputField('Security code', 'cvv', 'number', true, { step: 1 }) : ''}
                    </div>
                    ${FormField.getInputField('Cardholder name', 'cardholderName', 'text', true, {}, accountOnFile.getValue('cardholderName'), true)}
                    <div id="networks"></div>
                    <button class="button primary" type="submit">Pay now</button>
                </form>
                <div id="error" class="error"></div>
            </div>
        `;
    };

    /**
     * Initializes the form validator for CVV
     * Uses the PaymentRequest object from the SDK to format (mask)
     */
    const setValidatorsAndFormatters = () => {
        const key = 'cvv';
        // add formatting cvv on input
        form.elements[key]?.addEventListener('input', (e) => {
            const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, e.target.value);
            e.target.value = paymentRequest.getField(key).getMaskedValue();
        });

        // add cvv validation on change
        form.elements[key]?.addEventListener('change', (e) => {
            const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, e.target.value);
            if (!paymentRequest.getField(key).validate().isValid) {
                e.target.classList.add('error');
            } else {
                e.target.classList.remove('error');
            }
        });
    };

    /**
     * Validates the payment data and stores data if valid.
     * Redirects to the Finalize page.
     *
     * @param {SubmitEvent} e
     */
    const processPayment = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const paymentRequest = PaymentRequestUtility.get(paymentProduct, 'cvv', form.elements['cvv']?.value ?? '');
        paymentRequest.setAccountOnFile(accountOnFile);

        if (paymentRequest.validate().isValid) {
            StorageService.setPaymentRequest(paymentRequest);
            StorageService.setCardPaymentSpecificData({
                token: accountOnFile.id,
                cvv: form.elements['cvv'].value,
                paymentProductId: paymentProduct.id
            });

            window.location.href = Pages.Finalize;
        }
    };

    /**
     * Initializes the page and mounts it to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     * @returns {Promise<void>}
     */
    const init = async (mountingPoint) => {
        Loader.show();

        sdkClient = sdk.init(StorageService.getSessionData());
        const context = StorageService.getPaymentContext();

        paymentProduct = await PaymentProductService.getPaymentProduct(
            sdkClient,
            StorageService.getPaymentProductId(),
            context
        ).catch((error) => console.error(error));

        if (!paymentProduct) {
            window.location = Pages.Payment;
        }

        accountOnFile = paymentProduct.accountsOnFile.find((aof) => aof.id === StorageService.getAccountOnFileId());

        mountingPoint.innerHTML = getTemplate(context);
        form = document.getElementById('creditCardForm');
        form.addEventListener('submit', processPayment);

        setValidatorsAndFormatters();
        Loader.hide();
    };

    /**
     * Mounts the page to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     * @returns {Promise<void>}
     */
    const mount = (mountingPoint) => {
        if (!StorageService.getSessionData() || !StorageService.getPaymentContext()) {
            window.location = Pages.Home;
        } else if (!StorageService.getPaymentProductId() || !StorageService.getAccountOnFileId()) {
            window.location = Pages.Payment;
        } else {
            return init(mountingPoint);
        }
    };

    return { mount };
};

export default AccountOnFilePage();
