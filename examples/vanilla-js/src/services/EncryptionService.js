// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

import StorageService from './StorageService.js';

const EncryptionService = () => {
    /**
     * Encrypts the request.
     *
     * @param {sdk.OnlinePaymentSdk} sdkClient
     * @param {sdk.PaymentRequest} paymentRequest
     */
    const encrypt = async (sdkClient, paymentRequest) => {
        const encryptedRequest = await sdkClient.encryptPaymentRequest(paymentRequest);
        StorageService.setEncryptedData(encryptedRequest.encryptedCustomerInput);
    };

    return { encrypt };
};

export default EncryptionService();
