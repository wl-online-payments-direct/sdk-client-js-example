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
import { PaymentProduct, PaymentRequest } from 'onlinepayments-sdk-client-js';

const PaymentRequestUtility = () => {
    const get = (paymentProduct?: PaymentProduct | null, key?: string, value?: string) => {
        if (!paymentProduct) {
            return null;
        }

        const paymentRequest = new PaymentRequest(paymentProduct);
        if (key && value) {
            paymentRequest.getField(key).setValue(value);
        }

        return paymentRequest;
    };

    return { get };
};

export default PaymentRequestUtility();
