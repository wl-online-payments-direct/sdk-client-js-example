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
import type { PaymentRequest, OnlinePaymentSdk } from 'onlinepayments-sdk-client-js';
import StorageService from './StorageService';

const EncryptionService = () => {
    const encrypt = async (sdk: OnlinePaymentSdk, paymentRequest: PaymentRequest) => {
        const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);
        StorageService.setEncryptedData(encryptedRequest.encryptedCustomerInput);
    };

    return { encrypt };
};

export default EncryptionService();
