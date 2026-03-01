// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

const PaymentProductService = () => {
    /**
     * Encrypts the request.
     *
     * @param {sdk.OnlinePaymentSdk} sdkClient
     * @param {number} paymentProductId
     * @param {sdk.PaymentContext} paymentContext
     */
    const getPaymentProduct = async (sdkClient, paymentProductId, paymentContext) => {
        try {
            return await sdkClient.getPaymentProduct(paymentProductId, paymentContext);
        } catch (error) {
            console.error('Failed to retrieve payment product: ', error);
            return null;
        }
    };

    return { getPaymentProduct };
};

export default PaymentProductService();
