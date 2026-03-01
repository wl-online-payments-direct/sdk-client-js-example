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
