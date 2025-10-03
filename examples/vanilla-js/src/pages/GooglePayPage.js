import * as sdk from 'onlinepayments-sdk-client-js';

import StorageService from '../services/StorageService.js';
import Pages from '../constants/pages.js';
import Loader from '../components/Loader.js';
import Logo from '../components/Logo.js';
import NumberFormatter from '../utilities/NumberFormatter.js';
import EncryptionService from '../services/EncryptionService.js';

/**
 * A Google Pay page.
 * Renders a page for opening Google Pay Sheet.
 *
 * @returns {{mount: ((function(HTMLElement): Promise<void>)|*)}}
 * @constructor
 */
const GooglePayPage = () => {
    /** @type sdk.PaymentProduct */
    let paymentProduct;

    /** @type sdk.Session */
    let session;

    /** @type sdk.PaymentRequest */
    let paymentRequest;

    let paymentsClient = null;
    let baseRequest = null;

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
                <h1 class="m-0">Pay with Google Pay</h1>
                <p class="self-start m-0"><strong>Total amount: ${NumberFormatter.formatAmount(paymentDetails.amountOfMoney)} ${paymentDetails.amountOfMoney.currencyCode}</strong></p>
                <a href="${Pages.Payment}" class="button link self-start">← Back to payment method selection</a>
                <div id="googlePay" class="form flex column center"></div>
                <div id="error" class="error"></div>
            </div>
        `;
    };

    /**
     * Creates base request
     *
     @param {string[]} allowedNetworks
     @returns {Object} - The payment request base object.
     */
    const createBaseRequest = (allowedNetworks) => ({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: allowedNetworks
                }
            }
        ]
    });

    /**
     * Updates Payment Request object with token received from Google Pay.
     * Encrypts data and stores it in StorageService.
     * Redirects to Finalize Payment Page.
     *
     * @param {string?} token
     */
    const handleEncryptGooglePayData = (token) => {
        if (!token) {
            return;
        }

        paymentRequest.setValue('encryptedPaymentData', token);

        if (paymentRequest.isValid()) {
            EncryptionService.encrypt(session, paymentRequest)
                .then(() => {
                    StorageService.setPaymentRequest(paymentRequest);
                    window.location.href = Pages.Finalize;
                })
                .catch((errors) => {
                    document.getElementById('error').innerHTML = 'Errors: ' + JSON.stringify(errors);
                });
        }
    };

    /**
     * Configures Google Pay via Payment Request Object and calls Google Pay Sheet
     *
     @param {sdk.PaymentContextWithAmount} paymentDetails - An object containing the payment details required to fetch payment products.
     @param {sdk.PaymentProduct} paymentProduct - An object containing specific payment data used for Google Pay Request Object.
     */
    const onGooglePayButtonClicked = (paymentDetails, paymentProduct) => {
        const paymentRequest = Object.assign({}, baseRequest, {
            allowedPaymentMethods: [
                Object.assign({}, baseRequest.allowedPaymentMethods[0], {
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: paymentProduct.paymentProduct320SpecificData.gateway,
                            gatewayMerchantId: 'DemoMerchant'
                        }
                    }
                })
            ],
            merchantInfo: {
                merchantName: 'Demo Merchant'
            },
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: NumberFormatter.formatAmountForGooglePay(paymentDetails.amountOfMoney),
                currencyCode: paymentDetails.amountOfMoney.currencyCode,
                countryCode: paymentProduct.json.acquirerCountry || paymentDetails.countryCode
            }
        });

        paymentsClient
            .loadPaymentData(paymentRequest)
            .then((paymentData) => {
                handleEncryptGooglePayData(paymentData?.paymentMethodData?.tokenizationData?.token);
            })
            .catch((errors) => {
                console.error(errors);
            });
    };

    /**
     * Initializes the Google Pay button, saves SDK Payment Request and prepares Google Pay Sheet.
     */
    const setupGooglePayIntegration = () => {
        const context = StorageService.getPaymentContext();

        paymentRequest = new sdk.PaymentRequest();
        paymentRequest.setPaymentProduct(paymentProduct);

        baseRequest = createBaseRequest(paymentProduct.paymentProduct320SpecificData.networks);

        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST'
        });

        paymentsClient
            .isReadyToPay(baseRequest)
            .then((response) => {
                if (response.result) {
                    // noinspection JSUnusedGlobalSymbols
                    const button = paymentsClient.createButton({
                        onClick: () => onGooglePayButtonClicked(context, paymentProduct)
                    });
                    document.getElementById('googlePay').appendChild(button);
                }
            })
            .catch((err) => {
                console.error(err);
                document.getElementById('error').innerHTML = 'Google Pay not ready.';
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
        Loader.hide();
        setupGooglePayIntegration();
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

export default GooglePayPage();
