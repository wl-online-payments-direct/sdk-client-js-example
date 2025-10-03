import type { PaymentRequest, Session } from 'onlinepayments-sdk-client-js';
import StorageService from './StorageService';

const EncryptionService = () => {
    const encrypt = async (session: Session, paymentRequest: PaymentRequest) => {
        const encryptor = session.getEncryptor();

        const encryptedString = await encryptor.encrypt(paymentRequest);
        StorageService.setEncryptedData(encryptedString);
    };

    return { encrypt };
};

export default EncryptionService();
