import { IinDetailStatus, PaymentContextWithAmount, OnlinePaymentSdk } from 'onlinepayments-sdk-client-js';

const errorMessage = new Map([
    [IinDetailStatus.UNKNOWN, 'Unknown error'],
    [IinDetailStatus.NOT_ENOUGH_DIGITS, 'Card number does not contains enough digits']
]);

const getIinDetails = async (sdk: OnlinePaymentSdk, cardNumber: string, paymentContext: PaymentContextWithAmount) => {
    const iinDetailsResponse = await sdk.getIinDetails(cardNumber, paymentContext);

    if (iinDetailsResponse.status !== 'SUPPORTED') {
        throw new Error(`Failed getting IinDetails, check your credentials`);
    }

    if (typeof iinDetailsResponse.paymentProductId === 'undefined') {
        throw new Error(`Failed getting IinDetails, paymentProductId is not defined`);
    }

    return iinDetailsResponse;
};

const isIinDetailsResponse = (
    err: unknown
): err is Record<string, unknown> & {
    status: IinDetailStatus;
} => {
    return !!(err && typeof err === 'object' && 'status' in err);
};

/**
 * Get IIN details where status is SUPPORTED
 * And throw correct error messages if the promise is rejected
 */
export const getSupportedIinDetails = async (
    sdk: OnlinePaymentSdk,
    cardNumber: string,
    paymentContext: PaymentContextWithAmount
) => {
    try {
        return await getIinDetails(sdk, cardNumber, paymentContext);
    } catch (err) {
        throw new Error(
            isIinDetailsResponse(err)
                ? `Card check error: ${errorMessage.get(err.status)}`
                : `Failed getting IinDetails, check your credentials.`
        );
    }
};
