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
        const paymentRequest = new sdk.PaymentRequest(paymentProduct);
        key && paymentRequest.setValue(key, value);

        return paymentRequest;
    };

    return { get };
};

export default PaymentRequestUtility();
