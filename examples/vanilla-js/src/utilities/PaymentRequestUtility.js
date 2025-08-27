import * as sdk from 'onlinepayments-sdk-client-js';

/**
 * Utility for creating a payment request.
 *
 * @returns {{get: (function(sdk.PaymentProduct?, string?, *?): PaymentRequest)}}
 * @constructor
 */
const PaymentRequestUtility = () => {
    /**
     * Helper method to create a base payment request and set a specified value.
     * This is used in validating inputs. We create a new object, set only the value we want to validate,
     * and then get validation errors from the object. If there are errors, we know that they are related only to
     * the given key. @see setValidatorsAndFormatters (CreditCardPage.js).
     *
     * @param {sdk.PaymentProduct?} paymentProduct
     * @param {string?} key
     * @param {any?} value
     * @returns {sdk.PaymentRequest}
     */
    const get = (paymentProduct, key, value) => {
        const paymentRequest = new sdk.PaymentRequest();
        paymentRequest.setPaymentProduct(paymentProduct);
        key && paymentRequest.setValue(key, value);

        return paymentRequest;
    };

    return { get };
};

export default PaymentRequestUtility();
