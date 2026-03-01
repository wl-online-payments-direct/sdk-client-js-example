// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

import Logo from '../components/Logo.js';
import StorageService from '../services/StorageService.js';
import Pages from '../constants/pages.js';
import PaymentDetails from './Partials/PaymentDetails.js';
import PaymentProductsSelection from './Partials/PaymentProductsSelection.js';
import Loader from '../components/Loader.js';
import AccountsOnFileSelection from './Partials/AccountsOnFileSelection.js';
import { CommunicationError } from 'onlinepayments-sdk-client-js';

/**
 * Represents the Payment Selection Page.
 *
 * This module is responsible for rendering the PaymentSelectionPage, managing the fetching
 * and displaying of payment products, handling the selection of payment products and accounts on file,
 * as well as managing the interaction flow for payment processing and displaying related error messages.
 *
 * The page uses session details stored within the application to fetch payment details via the SDK and
 * provides an interactive interface for users to select payment methods and finalize their choices.
 */
const PaymentSelectionPage = () => {
    /** @type {sdk.BasicPaymentProducts} */
    let basicPaymentProducts;

    /** @type {sdk.OnlinePaymentSdk} */
    let session;

    /**
     * Page HTML.
     *
     * @type {string}
     */
    const template = `
        <div class="page">
            ${Logo.render()}
            <h1>Payment details</h1>
            <div id="paymentDetails"></div>
            <div class="flex row">
                <div class="flex-expand" id="paymentProductSelection"></div>
                <div class="flex-expand" id="paymentProductSelectionAOF"></div>
            </div>
            <div class="error" id="error"></div>
        </div>
    `;

    /**
     * Handles unauthorized errors by clearing the user session and redirecting to the home page.
     *
     * This function checks if the provided error object corresponds to a 403 HTTP status code.
     * If so, it clears stored data through the `StorageService` and redirects the user to the home page URL.
     *
     * @param {sdk.SdkError} error - The error object potentially containing a response status code.
     */
    const handleUnauthorizedError = (error) => {
        if (error instanceof CommunicationError) {
            StorageService.clear();
            window.location = Pages.Home;
        }
    };

    /**
     * Handles the setting of payment details and manages the loading of payment products and related UI updates.
     * Fetches the available payment products based on the provided payment details. If accounts on file are available,
     * initializes a selection component for accounts on file. Also initializes a selection component for payment
     * products. In case of an error during fetching, displays the error message on the UI. Manages the display of a
     * loading indicator while the process is ongoing.
     *
     * @param {sdk.PaymentContext} paymentDetails - An object containing the payment details required to fetch payment products.
     */
    const onSetPaymentDetails = (paymentDetails) => {
        Loader.show();
        let errorMessage = '';
        session
            .getBasicPaymentProducts(paymentDetails)
            .then((products) => {
                basicPaymentProducts = products;
            })
            .catch((error) => {
                handleUnauthorizedError(error);
                errorMessage = error.message;
            })
            .finally(() => {
                const paymentProductSelectionAOF = document.getElementById('paymentProductSelectionAOF');
                if (basicPaymentProducts?.accountsOnFile.length > 0) {
                    paymentProductSelectionAOF.style.display = 'unset';
                    AccountsOnFileSelection(basicPaymentProducts.accountsOnFile, handleAccountOnFileSelected).mount(
                        paymentProductSelectionAOF
                    );
                } else {
                    paymentProductSelectionAOF.style.display = 'none';
                }

                PaymentProductsSelection(basicPaymentProducts?.paymentProducts, handleProductSelected).mount(
                    document.getElementById('paymentProductSelection')
                );

                document.getElementById('error').innerHTML = errorMessage;
                Loader.hide();
            });
    };

    /**
     * Uses SDK to fetch the payment product and then store it locally.
     *
     * @param {number} productId
     * @returns {Promise<*>}
     */
    const setSelectedProduct = async (productId) => {
        Loader.show();
        const paymentProduct = await session.getPaymentProduct(productId, StorageService.getPaymentContext());
        if (!paymentProduct) {
            document.getElementById('error').innerHTML = 'Payment product not found.';
            return;
        }

        StorageService.setPaymentProductId(paymentProduct.id);
        Loader.hide();

        return paymentProduct;
    };

    /**
     * Handles the product selection based on the provided product ID.
     * Fetches and sets the selected product, then redirects to the respective page
     * for products with a card payment method. Displays an error message if the
     * product does not support card payment.
     *
     * @param {number} productId - The unique identifier of the product to be selected.
     * @returns {Promise<void>}
     */
    const handleProductSelected = async (productId) => {
        const product = await setSelectedProduct(productId);
        if (product.paymentMethod === 'card') {
            window.location = Pages.CreditCard;
        } else if (product.paymentMethod === 'mobile' && product?.label === 'GOOGLEPAY') {
            window.location = Pages.GooglePay;
        } else {
            document.getElementById('error').innerHTML = 'This payment product is not supported in this demo.';
        }
    };

    /**
     * Handles the selection of an account on file (AOF) by the user.
     * Sets the selected account on file id, fetches and sets a product for the selected AOF id. Redirects to the
     * respective page for products with the card payment method. Displays an error if the method is unsupported.
     *
     * @param {string} aofId - The unique identifier of the selected account on file.
     */
    const handleAccountOnFileSelected = async (aofId) => {
        Loader.show();
        const aof = basicPaymentProducts.accountsOnFile.find((aof) => aof.id === aofId);

        const product = await setSelectedProduct(aof.paymentProductId);
        StorageService.setAccountOnFileId(aofId);

        if (product.paymentMethod === 'card') {
            window.location = Pages.AccountOnFile;
        } else {
            document.getElementById('error').innerHTML = 'This demo supports only card payment products.';
        }

        Loader.hide();
    };

    /**
     * Mounts the page to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        let sessionData = StorageService.getSessionData();

        if (!sessionData) {
            window.location = Pages.Home;
            return;
        }

        session = sdk.init(sessionData);

        mountingPoint.innerHTML = template;

        StorageService.clearItem('accountOnFileId');
        PaymentDetails(onSetPaymentDetails).mount(document.getElementById('paymentDetails'));
    };

    return {
        mount
    };
};

export default PaymentSelectionPage();
