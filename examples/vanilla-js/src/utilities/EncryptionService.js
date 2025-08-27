// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

import StorageService from './StorageService.js';

const EncryptionService = () => {
    /**
     * Encrypts the request.
     *
     * @param {sdk.Session} session
     * @param {sdk.PaymentRequest} paymentRequest
     */
    const encrypt = (session, paymentRequest) => {
        const encryptor = session.getEncryptor();
        return encryptor.encrypt(paymentRequest).then((encryptedString) => {
            StorageService.setEncryptedData(encryptedString);
        });
    };

    return { encrypt };
};

export default EncryptionService();
