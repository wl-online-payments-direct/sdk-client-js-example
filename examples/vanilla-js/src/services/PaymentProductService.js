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
// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

const PaymentProductService = () => {
    /**
     * Encrypts the request.
     *
     * @param {sdk.OnlinePaymentSdk} sdkClient
     * @param {number} paymentProductId
     * @param {sdk.PaymentContext} paymentContext
     */
    const getPaymentProduct = async (sdkClient, paymentProductId, paymentContext) => {
        try {
            return await sdkClient.getPaymentProduct(paymentProductId, paymentContext);
        } catch (error) {
            console.error('Failed to retrieve payment product: ', error);
            return null;
        }
    };

    return { getPaymentProduct };
};

export default PaymentProductService();
