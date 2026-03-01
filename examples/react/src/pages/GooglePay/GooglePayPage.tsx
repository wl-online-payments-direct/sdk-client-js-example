import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoader } from '../../components/Loader/Loader.tsx';
import { Link, useNavigate } from 'react-router-dom';
import GooglePayButton from '@google-pay/button-react';
import StorageService from '@shared/services/StorageService';
import {
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct,
    PaymentRequest,
    type SessionData
} from 'onlinepayments-sdk-client-js';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import EncryptionService from '@shared/services/EncryptionService';
import translations from '../../translations/translations.ts';
import Logo from '../../components/Logo/Logo.tsx';
import PaymentProductService from '@shared/services/PaymentProductService.ts';

const GooglePayPage = () => {
    const { show, hide } = useLoader();
    const sdk = useRef<OnlinePaymentSdk>(null);
    const navigate = useNavigate();

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();
    const [paymentProduct, setPaymentProduct] = useState<PaymentProduct>();

    const [errorMessage, setErrorMessage] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            show();

            const sessionData = StorageService.getSessionData();
            const context = StorageService.getPaymentContext();

            if (!sessionData || !context) {
                hide();
                navigate('/');
                return;
            }

            setPaymentContext(context);
            sdk.current = init(sessionData as SessionData);

            const paymentProductId = StorageService.getPaymentProductId();

            if (paymentProductId) {
                const product = await PaymentProductService.getPaymentProduct(
                    sdk.current,
                    Number(paymentProductId),
                    context
                );

                if (product) {
                    setPaymentProduct(product);
                    setIsLoading(false);
                    hide();

                    return;
                }

                setErrorMessage(translations.payment_product_not_found);
            }

            hide();
            setIsLoading(false);
            navigate('/payment');
        };

        initData().catch((error) => console.error(error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const googlePaymentRequest = useMemo(() => {
        if (!paymentProduct) {
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

        const paymentRequest = new PaymentRequest(paymentProduct!);

        paymentRequest.setValue('encryptedPaymentData', token);

        if (paymentRequest.validate().isValid && sdk.current) {
            EncryptionService.encrypt(sdk.current, paymentRequest)
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
            <div className={`form flex column center m-0 form-max-height ${isLoading ? 'invisible' : ''}`}>
                {googlePaymentRequest && paymentProduct ? (
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
                    !isLoading && <div className='error'>{translations.google_pay_not_ready}</div>
                )}
            </div>
            <div id='error' className='error'>
                {errorMessage}
            </div>
        </div>
    );
};

export default GooglePayPage;
