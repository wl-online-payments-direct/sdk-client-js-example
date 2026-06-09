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
import { OnlinePaymentSdk, PaymentContextWithAmount, PaymentRequest } from 'onlinepayments-sdk-client-js';
import { getSupportedIinDetails } from './get-supported-iin-details';

export async function createPayload(
    sdk: OnlinePaymentSdk,
    cardNumber: string,
    paymentContext: PaymentContextWithAmount
) {
    // get payment product from IIN details
    const { paymentProductId } = await getSupportedIinDetails(sdk, cardNumber, paymentContext);
    if (typeof paymentProductId === 'undefined') {
        throw new Error(`Failed getting IinDetails, paymentProductId is not defined`);
    }

    // get payment product
    const paymentProduct = await sdk.getPaymentProduct(paymentProductId, paymentContext);

    // update session payment request instance
    const paymentRequest = new PaymentRequest(paymentProduct);
    paymentRequest.setValue('cardNumber', cardNumber);
    paymentRequest.setValue('cvv', '123');
    paymentRequest.setValue('cardholderName', 'John Doe');
    paymentRequest.setValue(
        'expiryDate',
        Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            year: '2-digit'
        }).format(new Date())
    );

    // validate payment request
    const validationResult = paymentRequest.validate();

    if (!validationResult.isValid) {
        throw new Error(`Errors found in ${validationResult.errors}`);
    }

    // encrypt the payment request
    const encryptionData = await sdk.encryptPaymentRequest(paymentRequest);

    return encryptionData.encryptedCustomerInput;
}
