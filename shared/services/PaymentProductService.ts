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
import { OnlinePaymentSdk, type PaymentContext, type PaymentProduct } from 'onlinepayments-sdk-client-js';

const PaymentProductService = () => {
    const getPaymentProduct = async (
        sdk: OnlinePaymentSdk,
        paymentProductId: number,
        context: PaymentContext
    ): Promise<PaymentProduct | null> => {
        try {
            return await sdk.getPaymentProduct(paymentProductId, context);
        } catch (error) {
            console.error('Failed to retrieve payment product: ', error);
            return null;
        }
    };

    return {
        getPaymentProduct
    };
};

export default PaymentProductService();
