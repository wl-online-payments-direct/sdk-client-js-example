import { PaymentProduct, PaymentRequest } from 'onlinepayments-sdk-client-js';

const PaymentRequestUtility = () => {
    const get = (paymentProduct?: PaymentProduct, key?: string, value?: string) => {
        if (!paymentProduct) {
            return null;
        }

        const paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentProduct(paymentProduct);
        if (key) {
            paymentRequest.setValue(key, value);
        }

        return paymentRequest;
    };

    return { get };
};

export default PaymentRequestUtility();
