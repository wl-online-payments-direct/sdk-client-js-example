import { PaymentContextWithAmount, PaymentRequest, Session } from 'onlinepayments-sdk-client-js';
import { getSupportedIinDetails } from './get-supported-iin-details';

export async function createPayload(session: Session, cardNumber: string, paymentContext: PaymentContextWithAmount) {
    // get payment product from IIN details
    const { paymentProductId } = await getSupportedIinDetails(session, cardNumber, paymentContext);
    if (typeof paymentProductId === 'undefined') {
        throw new Error(`Failed getting IinDetails, paymentProductId is not defined`);
    }

    // get payment product
    const paymentProduct = await session.getPaymentProduct(paymentProductId, paymentContext);

    // update session payment request instance
    const paymentRequest = new PaymentRequest();
    paymentRequest.setPaymentProduct(paymentProduct);
    paymentRequest.setValue('cardNumber', cardNumber);
    paymentRequest.setValue('cvv', '123');
    paymentRequest.setValue('cardholderName', 'John Doe');
    paymentRequest.setValue(
        'expiryDate',
        Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            year: '2-digit'
        }).format(new Date())
    );

    // validate payment request
    if (!paymentRequest.isValid()) {
        throw new Error(`Errors found in ${paymentRequest.getErrorMessageIds()}`);
    }

    // encrypt the payment request
    const encryptor = session.getEncryptor();

    return encryptor.encrypt(paymentRequest);
}
