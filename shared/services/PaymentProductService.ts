import { OnlinePaymentSdk, type PaymentContext, type PaymentProduct } from 'onlinepayments-sdk-client-js';

const PaymentProductService = () => {
    const getPaymentProduct = async (
        sdk: OnlinePaymentSdk,
        paymentProductId: number,
        context: PaymentContext
    ): Promise<PaymentProduct | null> => {
        try {
            return await sdk.getPaymentProduct(paymentProductId, context);
        } catch (error) {
            console.error('Failed to retrieve payment product: ', error);
            return null;
        }
    };

    return {
        getPaymentProduct
    };
};

export default PaymentProductService();
