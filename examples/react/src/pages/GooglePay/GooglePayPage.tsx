import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoader } from '../../components/Loader/Loader.tsx';
import { Link, useNavigate } from 'react-router-dom';
import GooglePayButton from '@google-pay/button-react';
import StorageService from '@shared/services/StorageService';
import { type PaymentContextWithAmount, PaymentProduct, PaymentRequest, Session } from 'onlinepayments-sdk-client-js';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import EncryptionService from '@shared/services/EncryptionService';
import translations from '../../translations/translations.ts';
import Logo from '../../components/Logo/Logo.tsx';

const GooglePayPage = () => {
    const { show, hide } = useLoader();
    const navigate = useNavigate();

    const session = useRef<Session>(null);

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();
    const [paymentProduct, setPaymentProduct] = useState<PaymentProduct>();

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        show();
        if (!StorageService.getSession()) {
            hide();
            navigate('/');
        }

        if (!StorageService.getPaymentProduct()) {
            hide();
            navigate(`/payment/`);
        }

        if (StorageService.getPaymentContext()) {
            setPaymentContext(StorageService.getPaymentContext()!);
        }

        const product = new PaymentProduct(StorageService.getPaymentProduct()!);
        setPaymentProduct({ ...product } as PaymentProduct);

        session.current = new Session(StorageService.getSession()!);

        hide();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const googlePaymentRequest = useMemo(() => {
        if (!paymentProduct) {
            setErrorMessage(translations.payment_product_not_found);
            return null;
        }

        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
                {
                    type: 'CARD',
                    parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: (paymentProduct.paymentProduct320SpecificData
                            ?.networks as google.payments.api.CardNetwork[]) ?? ['VISA', 'MASTERCARD']
                    },
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: paymentProduct.paymentProduct320SpecificData?.gateway ?? 'example',
                            gatewayMerchantId: 'DemoMerchant'
                        }
                    }
                }
            ] satisfies google.payments.api.PaymentMethodSpecification[],
            merchantInfo: {
                merchantName: 'Demo merchant',
                merchantId: 'demoMerchant'
            } as google.payments.api.MerchantInfo,
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: NumberFormatter.formatAmountForGooglePay(
                    paymentContext?.amountOfMoney.currencyCode ?? 'EUR',
                    paymentContext?.amountOfMoney.amount ?? 1000
                ),
                currencyCode: paymentContext?.amountOfMoney?.currencyCode,
                countryCode: paymentContext?.countryCode
            } as google.payments.api.TransactionInfo
        };
    }, [
        paymentContext?.amountOfMoney.amount,
        paymentContext?.amountOfMoney.currencyCode,
        paymentContext?.countryCode,
        paymentProduct
    ]);

    const handleEncryptGooglePayData = (paymentData: google.payments.api.PaymentData) => {
        const token = paymentData.paymentMethodData?.tokenizationData?.token;

        if (!token) {
            return;
        }

        const paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentProduct(paymentProduct as PaymentProduct);

        paymentRequest.setValue('encryptedPaymentData', token);

        if (paymentRequest.isValid() && session.current) {
            EncryptionService.encrypt(session.current, paymentRequest)
                .then(() => {
                    StorageService.setPaymentRequest(paymentRequest);
                    navigate('/payment/finalize');
                })
                .catch((errors) => {
                    setErrorMessage('Errors: ' + JSON.stringify(errors));
                });
        }
    };

    return (
        <div className='page flex column center'>
            <Logo />
            <h1 className='m-0'>{translations.pay_with_google_pay}</h1>
            <p className='self-start m-0'>
                <strong>
                    {translations.total_amount}{' '}
                    {paymentContext &&
                        paymentContext.amountOfMoney.amount &&
                        paymentContext.amountOfMoney.currencyCode &&
                        NumberFormatter.formatAmount(
                            paymentContext.amountOfMoney.currencyCode,
                            paymentContext.amountOfMoney.amount
                        )}{' '}
                    {paymentContext?.amountOfMoney?.currencyCode}
                </strong>
            </p>
            <Link to='/payment/' className='button link self-start'>
                {translations.back_to_payment_method_selection}
            </Link>
            <div className='form flex column center m-0'>
                {googlePaymentRequest ? (
                    <GooglePayButton
                        environment='TEST'
                        buttonColor='default'
                        buttonType='pay'
                        existingPaymentMethodRequired={false}
                        onLoadPaymentData={(paymentData) => handleEncryptGooglePayData(paymentData)}
                        onError={(error) => {
                            if ('statusMessage' in error) {
                                setErrorMessage(error.statusMessage);
                            } else {
                                setErrorMessage(error.message);
                            }
                        }}
                        paymentRequest={googlePaymentRequest}
                    />
                ) : (
                    <div className='error'>{translations.google_pay_not_ready}</div>
                )}
            </div>
            <div id='error' className='error'>
                {errorMessage}
            </div>
        </div>
    );
};

export default GooglePayPage;
