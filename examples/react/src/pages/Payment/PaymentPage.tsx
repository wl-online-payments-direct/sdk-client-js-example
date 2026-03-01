import { useCallback, useEffect, useRef, useState } from 'react';
import {
    BasicPaymentProducts,
    CommunicationError,
    init,
    type OnlinePaymentSdk,
    type PaymentContext,
    type PaymentContextWithAmount,
    type SdkError,
    type SessionData
} from 'onlinepayments-sdk-client-js';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../../components/Loader/Loader.tsx';
import PaymentDetails from '../../components/PaymentDetails/PaymentDetails.tsx';
import ProductSelection from '../../components/ProductSelection/ProductSelection.tsx';
import AccountOnFileSelection from '../../components/AccountOnFileSelection/AccountOnFileSelection.tsx';
import Logo from '../../components/Logo/Logo.tsx';
import translations from '../../translations/translations.ts';
import StorageService from '@shared/services/StorageService';

const PaymentContextInitialState = {
    amountOfMoney: {
        amount: 1000,
        currencyCode: 'EUR'
    },
    countryCode: 'BE',
    isRecurring: false
} satisfies PaymentContextWithAmount;

const PaymentPage = () => {
    const sdk = useRef<OnlinePaymentSdk>(null);
    const [paymentContext, setPaymentContext] = useState<PaymentContext>(
        () => StorageService.getPaymentContext() ?? { ...PaymentContextInitialState }
    );

    const navigate = useNavigate();
    const { show, hide } = useLoader();

    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const [paymentMethods, setPaymentMethods] = useState<BasicPaymentProducts>();

    useEffect(() => {
        StorageService.clearItem('accountOnFileId');
        const sessionData = StorageService.getSessionData();

        if (!sessionData) {
            navigate('/');
        } else {
            sdk.current = init(sessionData as SessionData);
        }
    }, [navigate]);

    const handleExpandCollapse = useCallback(() => {
        setIsFormExpanded((prev) => !prev);
    }, []);

    const handleUnauthorizedError = (error: SdkError) => {
        if (error instanceof CommunicationError) {
            StorageService.clear();
            navigate('/');
        }
    };

    const fetchPaymentProducts = useCallback(
        (paymentDetails: PaymentContext) => {
            show();
            sdk?.current
                ?.getBasicPaymentProducts(paymentDetails)
                .then((basicPaymentProducts) => {
                    setPaymentMethods(basicPaymentProducts);
                    setErrorMessage('');
                })
                .catch((error: SdkError) => {
                    setErrorMessage(error?.message ?? '');
                    handleUnauthorizedError(error);
                    setPaymentMethods(undefined);
                })
                .finally(() => {
                    hide();
                });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const setSelectedProduct = async (productId: number) => {
        show();
        const paymentProduct = await sdk?.current?.getPaymentProduct(productId, paymentContext as PaymentContext);

        if (!paymentProduct) {
            setErrorMessage(translations.payment_product_not_found);
            return;
        }

        StorageService.setPaymentProductId(paymentProduct.id);
        hide();

        return paymentProduct;
    };

    const handleProductSelection = async (id: string) => {
        const product = await setSelectedProduct(Number(id));

        if (product?.paymentMethod === 'card') {
            navigate(`/payment/credit-card/`);
        } else if (product?.paymentMethod === 'mobile' && product?.label === 'GOOGLEPAY') {
            navigate('/payment/google-pay/');
        } else {
            setErrorMessage(translations.this_demo_supports_only_card_payment_and_google_pay);
        }
    };

    const handleAccountOnFileSelection = async (id: string) => {
        const aof = paymentMethods?.accountsOnFile.find((aof) => aof.id === id);

        if (aof) {
            const product = await setSelectedProduct(aof.paymentProductId);

            StorageService.setAccountOnFileId(id);
            if (product?.paymentMethod === 'card') {
                navigate(`/payment/account-on-file/`);
            } else {
                setErrorMessage(translations.this_demo_supports_only_card_payment_and_google_pay);
            }
        }
    };

    const handlePaymentContextModelChange = <K extends keyof PaymentContext>(value: PaymentContext[K], prop: K) => {
        setPaymentContext?.((prev) => ({ ...(prev as PaymentContextWithAmount), [prop]: value }));
    };

    const handleSaveContextToStorage = useCallback(
        (context: PaymentContextWithAmount) => {
            StorageService.setPaymentContext(context);
            fetchPaymentProducts(context);
        },
        [fetchPaymentProducts]
    );

    return (
        <div className='page'>
            <Logo />
            <h1>{translations.payment_details}</h1>
            <p className='text-left'>{translations.order_details}</p>
            <PaymentDetails
                paymentContext={paymentContext}
                isFormExpanded={isFormExpanded}
                onExpandCollapse={handleExpandCollapse}
                onChangeContextModel={handlePaymentContextModelChange}
                onSaveContextToStorage={handleSaveContextToStorage}
            />
            <div className='flex row'>
                {paymentMethods?.paymentProducts && paymentMethods.paymentProducts.length > 0 && (
                    <ProductSelection
                        products={paymentMethods.paymentProducts}
                        onSelectedProduct={handleProductSelection}
                    />
                )}
                {paymentMethods && paymentMethods.accountsOnFile.length > 0 && (
                    <AccountOnFileSelection
                        accountsOnFile={paymentMethods.accountsOnFile}
                        onSelectedProduct={handleAccountOnFileSelection}
                    />
                )}
            </div>
            {errorMessage && <div className='error'>{errorMessage}</div>}
        </div>
    );
};

export default PaymentPage;
