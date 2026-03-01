// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

/**
 * A service for handling internal storage.
 */
const StorageService = () => {
    const storageKey = 'sdk-example-app-storage';

    /**
     * Gets the storage object from the local storage.
     *
     * @returns {object}
     */
    const getStorage = () => {
        if (!localStorage.getItem(storageKey)) {
            clear();
        }

        return JSON.parse(localStorage.getItem(storageKey));
    };

    /**
     * Gets one property from the storage.
     *
     * @param {string} key
     * @returns {any}
     */
    const getItem = (key) => {
        return getStorage()[key];
    };

    /**
     * Sets one property of the storage.
     *
     * @param {string} key
     * @param {any} value
     */
    const setItem = (key, value) => {
        const storage = getStorage();
        storage[key] = value;
        localStorage.setItem(storageKey, JSON.stringify(storage));
    };

    /**
     * Clears the storage.
     */
    const clear = () => {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                session: null,
                paymentContext: null,
                paymentProductId: null,
                encryptedData: null,
                cardPaymentSpecificData: null,
                accountOnFileId: null
            })
        );
    };

    /**
     * Clears the storage item.
     *
     * @param {string} key
     */
    const clearItem = (key) => {
        const storage = getStorage();
        if (storage[key]) {
            storage[key] = null;
        }
        localStorage.setItem(storageKey, JSON.stringify(storage));
    };

    /**
     * Sets session details.
     *
     * @param {sdk.SessionData} details
     */
    const setSessionDetails = (details) => {
        setItem('session', details);
    };

    /**
     * Gets session details.
     *
     * @returns {sdk.SessionData}
     */
    const getSessionData = () => {
        return getItem('session');
    };

    /**
     * Gets stored payment details.
     *
     * @returns {sdk.PaymentContextWithAmount | null}
     */
    const getPaymentContext = () => {
        return getItem('paymentContext');
    };

    /**
     * Sets payment details.
     *
     * @param {sdk.PaymentContextWithAmount} details
     */
    const setPaymentContext = (details) => {
        setItem('paymentContext', details);
    };

    /**
     * Gets stored payment product.
     *
     * @returns {number | null}
     */
    const getPaymentProductId = () => {
        const id = getItem('paymentProductId');
        if (!id) {
            return null;
        }

        return id;
    };

    /**
     * Sets payment product id.
     *
     * @param {number} id
     */
    const setPaymentProductId = (id) => {
        setItem('paymentProductId', id);
    };

    /**
     * Gets encrypted payment data.
     *
     * @returns {string}
     */
    const getEncryptedData = () => {
        return getItem('encryptedData');
    };

    /**
     * Sets encrypted payment data.
     *
     * @param {string} data
     */
    const setEncryptedData = (data) => {
        setItem('encryptedData', data);
    };

    /**
     * Gets account on file id.
     *
     * @returns {string|null} - id
     */
    const getAccountOnFileId = () => {
        return getItem('accountOnFileId');
    };

    /**
     * Sets account on file id.
     *
     * @param {string} data
     */
    const setAccountOnFileId = (data) => {
        setItem('accountOnFileId', data);
    };

    /**
     * Gets saved card payment specific data
     *
     * @returns {Object|null}
     * @property {string|undefined} token - The token as a string.
     * @property {string} cvv - CVV as a string.
     * @property {number} paymentProductId - Product id as a number.
     */
    const getCardPaymentSpecificData = () => {
        return getItem('cardPaymentSpecificData');
    };

    /**
     * Sets saved card payment specific data
     *
     * @param {Object} data
     * @param {string} [data.token] - The token as a string.
     * @param {string} [data.cvv] - CVV as a string.
     * @param {number} [data.paymentProductId ]- Product id as a number.
     */
    const setCardPaymentSpecificData = (data) => {
        setItem('cardPaymentSpecificData', data);
    };

    /**
     * Sets the PaymentRequest object.
     *
     * @param {sdk.PaymentRequest} paymentRequest
     */
    const setPaymentRequest = (paymentRequest) => {
        setItem('paymentRequest', { ...paymentRequest.getValues(), tokenize: paymentRequest.getTokenize() });
    };

    /**
     * Gets the stored PaymentRequest object.
     *
     * @returns {Record<string, any>}
     */
    const getPaymentRequestValues = () => {
        return getItem('paymentRequest');
    };

    return {
        getSessionData,
        setSessionDetails,
        getPaymentContext,
        setPaymentContext,
        getPaymentProductId,
        setPaymentProductId,
        getEncryptedData,
        setEncryptedData,
        getAccountOnFileId,
        setAccountOnFileId,
        getCardPaymentSpecificData,
        setCardPaymentSpecificData,
        clearItem,
        clear,
        setPaymentRequest,
        getPaymentRequestValues
    };
};

export default StorageService();
