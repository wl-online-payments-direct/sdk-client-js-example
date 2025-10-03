// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';
import Logo from '../components/Logo.js';
import StorageService from '../services/StorageService.js';
import Pages from '../constants/pages.js';
import FormField from '../components/FormField.js';
import Loader from '../components/Loader.js';
import NumberFormatter from '../utilities/NumberFormatter.js';
import PaymentRequestUtility from '../utilities/PaymentRequestUtility.js';
import EncryptionService from '../services/EncryptionService.js';

/**
 * A credit card page.
 * Renders a page for entering the credit card details.
 * Also, has utility functions for fetching currency conversion rate and calculated surcharge.
 *
 * @returns {{mount: ((function(HTMLElement): Promise<void>)|*)}}
 * @constructor
 */
const CreditCardPage = () => {
    /** @type sdk.PaymentProduct */
    let paymentProduct;

    /** @type HTMLFormElement */
    let form;

    /** @type sdk.Session */
    let session;

    /**
     * Gets the HTML Input element with the provided ID.
     *
     * @param {string} id
     * @returns {HTMLInputElement}
     */
    const getInput = (id) => {
        return document.getElementById(id);
    };

    /**
     * Returns the page HTML.
     *
     * @param {sdk.PaymentContext} paymentDetails
     * @returns {string}
     */
    const getTemplate = (paymentDetails) => {
        return `
            <div class="page flex column center">
                ${Logo.render()}
                <h1 class="m-0">Pay with a credit card</h1>
                <p class="self-start m-0"><strong>Total amount: ${NumberFormatter.formatAmount(paymentDetails.amountOfMoney)} ${paymentDetails.amountOfMoney.currencyCode}</strong></p>
                <p class="self-start m-0">Selected card type: ${paymentProduct.json.displayHints.label}</p>
                <a href="${Pages.Payment}" class="button link self-start">← Back to payment method selection</a>
                <form class="form" id="creditCardForm">
                    ${FormField.getInputField('Card number', 'cardNumber', 'text', true)}
                    <div class="flex row">
                        ${FormField.getInputField('Expiry date', 'expiryDate', 'text', true)}
                        ${paymentProduct.json.fields.find((f) => f.id === 'cvv') ? FormField.getInputField('Security code', 'cvv', 'number', true, { step: 1 }) : ''}
                    </div>
                    ${FormField.getInputField('Cardholder name', 'cardholderName', 'text', true)}
                    ${paymentProduct?.allowsTokenization ? FormField.getCheckboxField('Remember card for later use', 'tokenize', false) : ''}
                    <div id="networks"></div>
                    <button class="button primary" type="submit">Pay now</button>
                </form>
                <div id="error" class="error"></div>
                <div class="additional-utils form">
                    <h3 class="m-0">Currency conversion</h3>
                    <p class="text-left">This utility checks whether a currency conversion can be applied for the given card.</p>
                    <button id="calculateConversion" class="button secondary small">Get quote</button>
                    <div class="text-left error" id="errorCurrencyConversion"></div>
                    <div class="field" id="conversionResult"></div>
                </div>
                <div class="additional-utils form">
                    <h3 class="m-0">Calculate surcharge</h3>
                    <p class="text-left">This utility calculates the surchare for the given credit card, if enabled.</p>
                    <button id="calculateSurcharge" class="button secondary small">Calculate</button>
                    <div class="text-left error" id="errorSurcharge"></div>
                    <div class="field" id="surchargeResult"></div>
                </div>
            </div>
        `;
    };

    /**
     * Initializes the form validators and data formatters.
     * Uses the PaymentRequest object from the SDK to format (mask)
     */
    const setValidatorsAndFormatters = () => {
        ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'].forEach((key) => {
            const elem = getInput(key);
            // add formatting on input
            elem?.addEventListener('input', () => {
                const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, elem.value);
                elem.value = paymentRequest.getMaskedValue(key);
            });
            // add validation on change
            elem?.addEventListener('change', () => {
                const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, elem.value);
                if (paymentRequest.getErrorMessageIds().length) {
                    elem.classList.add('error');
                } else {
                    elem.classList.remove('error');
                    if (key === 'cardNumber' && elem.value.length > 5) {
                        getIinDetails(elem.value).then((details) => {
                            if (!details || details.paymentProductId !== paymentProduct.id) {
                                elem.classList.add('error');
                            }
                        });
                    }
                }
            });
        });
    };

    /**
     * Gets IIN details for the provider partial card number.
     *
     * @param {string} cardNumber
     * @returns {Promise<sdk.GetIINDetailsResponseJSON | null>}
     */
    const getIinDetails = (cardNumber) => {
        return session
            .getIinDetails(cardNumber.replaceAll(' ', '').trim(), StorageService.getPaymentContext())
            .catch(() => null);
    };

    /**
     * Validates the payment data and encrypts it if the data is valid.
     *
     * @param {SubmitEvent} e
     */
    const processPayment = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const paymentRequest = PaymentRequestUtility.get(paymentProduct);
        /** @type HTMLInputElement */
        const checkbox = document.querySelector('#tokenize');
        paymentRequest.setTokenize(checkbox?.checked);

        ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'].forEach((key) => {
            form.elements[key]?.value && paymentRequest.setValue(key, form.elements[key]?.value);
        });

        if (paymentRequest.isValid()) {
            const cardNumberInput = getInput('cardNumber');
            // check iin details for a correct card type for the selected payment product.
            getIinDetails(cardNumberInput.value)
                .then((details) => {
                    if (details?.paymentProductId !== paymentProduct.id) {
                        throw Error('Wrong card type');
                    }

                    EncryptionService.encrypt(session, paymentRequest)
                        .then(() => {
                            StorageService.setPaymentRequest(paymentRequest);
                            window.location.href = Pages.Finalize;
                        })
                        .catch((errors) => {
                            document.getElementById('error').innerHTML = 'Errors: ' + JSON.stringify(errors);
                        });
                })
                .catch(() => {
                    cardNumberInput.classList.add('error');
                    document.getElementById('error').innerHTML =
                        `Entered card number is not for ${paymentProduct.json.displayHints.label}.`;
                });
        }
    };

    /**
     * Sets up the currency conversion quote utility.
     * If the credit card input is valid, calls the SDK utility to retrieve the possible conversion quote.
     */
    const setupCurrencyConversion = () => {
        const calculateConversionButton = document.getElementById('calculateConversion');
        const errorPlaceholder = document.getElementById('errorCurrencyConversion');
        errorPlaceholder.style.display = 'none';

        calculateConversionButton.addEventListener('click', () => {
            errorPlaceholder.innerHTML = '';
            errorPlaceholder.style.display = 'none';
            const cardNumberInput = getInput('cardNumber');
            if (!cardNumberInput.classList.contains('error') && cardNumberInput.value.replaceAll(' ', '').length > 0) {
                processCurrencyConversion(cardNumberInput.value.replaceAll(' ', ''));
            } else {
                errorPlaceholder.style.display = 'block';
                errorPlaceholder.innerHTML = 'Please enter the card number.';
            }
        });
    };

    /**
     * Call the API to get the currency conversion quote and processes the result.
     * If the credit card is in other currency than the one selected, it will return the conversion rate
     * that would be applied.
     *
     * @param {string} cardNumber
     */
    const processCurrencyConversion = (cardNumber) => {
        Loader.show();
        const context = StorageService.getPaymentContext();
        const container = document.getElementById('conversionResult');
        const errorPlaceholder = document.getElementById('errorCurrencyConversion');
        container.innerHTML = '';
        session
            .getCurrencyConversionQuote(context.amountOfMoney, {
                partialCreditCardNumber: cardNumber,
                paymentProductId: paymentProduct.id
            })
            .then((response) => {
                if (response.result) {
                    container.innerHTML += `<div class="text">Result: ${response.result.result} (${response.result.resultReason})</div>`;
                }

                if (response.proposal?.rate) {
                    container.innerHTML += `<div class="text">Rate: ${response.proposal.rate.exchangeRate}</div>`;
                }
            })
            .catch((response) => {
                if (response.errors?.length) {
                    response.errors.forEach((error) => {
                        errorPlaceholder.innerHTML += `<div class="text">${error.message}</div>`;
                    });

                    errorPlaceholder.style.display = 'block';
                }
            })
            .finally(() => {
                Loader.hide();
            });
    };

    /**
     * Sets up the surcharge calculation utility.
     * If credit card input is valid, calls the SDK utility to retrieve the surcharge calculation.
     */
    const setupSurchargeCalculation = () => {
        const calculateSurchargeButton = document.getElementById('calculateSurcharge');
        const errorPlaceholder = document.getElementById('errorSurcharge');
        errorPlaceholder.style.display = 'none';

        calculateSurchargeButton.addEventListener('click', () => {
            errorPlaceholder.innerHTML = '';
            errorPlaceholder.style.display = 'none';
            const cardNumberInput = getInput('cardNumber');
            if (!cardNumberInput.classList.contains('error') && cardNumberInput.value.replaceAll(' ', '').length > 0) {
                processSurcharge(cardNumberInput.value.replaceAll(' ', ''));
            } else {
                errorPlaceholder.style.display = 'block';
                errorPlaceholder.innerHTML = 'Please enter the card number.';
            }
        });
    };

    /**
     * Calls the API to get the surcharge quote and processes the result.
     * If the merchant has set a surcharge on a specified payment product, it will return the surcharges
     * that would be applied and display them on the page.
     *
     * @param {string} cardNumber
     */
    const processSurcharge = (cardNumber) => {
        Loader.show();
        const context = StorageService.getPaymentContext();
        const container = document.getElementById('surchargeResult');
        const errorPlaceholder = document.getElementById('errorSurcharge');
        container.innerHTML = '';
        session
            .getSurchargeCalculation(context.amountOfMoney, {
                partialCreditCardNumber: cardNumber,
                paymentProductId: paymentProduct.id
            })
            .then((response) => {
                if (response.surcharges?.length) {
                    response.surcharges.forEach((surcharge, index) => {
                        if (surcharge.result === 'OK') {
                            container.innerHTML += `<div class="text">Surcharge ${index + 1}: ${surcharge.surchargeAmount.amount} ${surcharge.surchargeAmount.currencyCode}</div>`;
                        }
                    });
                }
            })
            .catch((response) => {
                if (response.errors?.length) {
                    response.errors.forEach((error) => {
                        errorPlaceholder.innerHTML += `<div class="text">${error.message}</div>`;
                    });
                    errorPlaceholder.style.display = 'block';
                }
            })
            .finally(() => {
                Loader.hide();
            });
    };

    /**
     * Initializes the page and mounts it to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     * @returns {Promise<void>}
     */
    const init = async (mountingPoint) => {
        Loader.show();
        const context = StorageService.getPaymentContext();
        paymentProduct = StorageService.getPaymentProduct();
        session = StorageService.getSession();

        mountingPoint.innerHTML = getTemplate(context);
        form = document.getElementById('creditCardForm');
        form.addEventListener('submit', processPayment);

        setValidatorsAndFormatters();
        setupCurrencyConversion();
        setupSurchargeCalculation();
        Loader.hide();
    };

    /**
     * Mounts the page to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     * @returns {Promise<void>}
     */
    const mount = (mountingPoint) => {
        if (!StorageService.getSession()) {
            window.location = Pages.Home;
        } else if (!StorageService.getPaymentProduct()) {
            window.location = Pages.Payment;
        } else {
            return init(mountingPoint);
        }
    };

    return { mount };
};

export default CreditCardPage();
