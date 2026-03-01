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
