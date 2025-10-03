import type { PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';

export type EncryptedData = {
    data: string;
};

export type CardPaymentSpecificData = {
    token: string;
    paymentProductId: number;
    cvv: string;
};

export type CreatePaymentRequest = (EncryptedData | CardPaymentSpecificData) & {
    paymentContext?: PaymentContextWithAmount;
};
