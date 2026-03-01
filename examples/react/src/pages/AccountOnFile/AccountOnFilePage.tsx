import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoader } from '../../components/Loader/Loader.tsx';
import {
    type AccountOnFile,
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct,
    type SessionData
} from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import Logo from '../../components/Logo/Logo.tsx';
import Input from '../../components/FormFields/Input/Input.tsx';
import translations from '../../translations/translations.ts';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import PaymentProductService from '@shared/services/PaymentProductService.ts';

const AccountOnFilePage = () => {
    const navigate = useNavigate();
    const sdk = useRef<OnlinePaymentSdk>(null);

    const { show, hide } = useLoader();

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();
    const [paymentProduct, setPaymentProduct] = useState<PaymentProduct>();

    const [accountOnFile, setAccountOnFile] = useState<AccountOnFile>();
    const [cvv, setCvv] = useState<string>();
    const [error, setError] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            show();

            const sessionData = StorageService.getSessionData();
            const paymentContext = StorageService.getPaymentContext();

            if (!sessionData || !paymentContext) {
                hide();
                navigate('/');
                return;
            }

            sdk.current = init(sessionData);
            setPaymentContext(paymentContext);

            const accountOnFileId = StorageService.getAccountOnFileId();
            const paymentProductId = StorageService.getPaymentProductId();

            if (!accountOnFileId || !paymentProductId) {
                hide();
                navigate('/payment');
                return;
            }

            sdk.current = init(sessionData as SessionData);

            const product = await PaymentProductService.getPaymentProduct(
                sdk.current,
                Number(paymentProductId),
                paymentContext
            );

            if (!product) {
                hide();
                navigate('/payment');
                return;
            }

            setPaymentProduct(product);
            hide();
        };

        initData().catch((error) => console.error(error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!paymentProduct) {
            return;
        }

        setIsLoading(false);

        const accountOnFileId = StorageService.getAccountOnFileId();
        if (accountOnFileId) {
            setAccountOnFile(paymentProduct.accountsOnFile.find((aof) => aof.id === accountOnFileId));
        }
    }, [paymentProduct]);

    const handleChangeCvv = (value: string, key: string) => {
        const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, value);

        const maskedCvv = paymentRequest?.getField(key).getMaskedValue();
        if (!paymentRequest?.getField(key).validate().isValid) {
            setError(true);
        } else {
            setError(false);
        }

        setCvv(maskedCvv);
    };

    const getExpiryDateMaskedValue = () => {
        const paymentRequest = PaymentRequestUtility.get(
            paymentProduct,
            'expiryDate',
            accountOnFile?.getValue('expiryDate')
        );

        return paymentRequest?.getField('expiryDate').getMaskedValue() ?? '';
    };

    const handleProcessPayment = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const paymentRequest = PaymentRequestUtility.get(paymentProduct, 'cvv', cvv)!;
        if (accountOnFile) {
            paymentRequest.setAccountOnFile(accountOnFile);
        }

        if (paymentRequest.validate().isValid && accountOnFile && cvv && paymentProduct?.id) {
            StorageService.setPaymentRequest(paymentRequest);

            StorageService.setCardPaymentSpecificData({
                token: accountOnFile.id,
                cvv: cvv,
                paymentProductId: paymentProduct.id
            });

            navigate('/payment/finalize');
        }
    };

    return (
        <div className='page flex column center'>
            <Logo />
            <h1 className='m-0'>{translations.pay_with_a_credit_card}</h1>
            <p className='self-start m-0'>
                <strong>
                    {translations.total_amount}{' '}
                    {paymentContext &&
                        paymentContext.amountOfMoney.currencyCode &&
                        paymentContext.amountOfMoney.currencyCode &&
                        NumberFormatter.formatAmount(
                            paymentContext.amountOfMoney.currencyCode,
                            paymentContext.amountOfMoney.amount
                        )}{' '}
                    {paymentContext?.amountOfMoney?.currencyCode}
                </strong>
            </p>
            <p className='self-start m-0'>
                {translations.selected_card_type} {paymentProduct?.label}
            </p>
            <Link to='/payment' className='button link self-start'>
                {translations.back_to_payment_method_selection}
            </Link>
            <form className={`form form-max-height ${!isLoading ? '' : 'invisible'}`} onSubmit={handleProcessPayment}>
                <Input
                    id='cardNumber'
                    type='text'
                    label={translations.card_number}
                    value={accountOnFile?.label ?? ''}
                    disabled={true}
                    required={true}
                />
                <div className='flex row'>
                    <Input
                        id='expiryDate'
                        type='text'
                        label={translations.expiry_date}
                        value={accountOnFile ? getExpiryDateMaskedValue() : ''}
                        disabled={true}
                        required={true}
                    />
                    {paymentProduct?.fields.find((field) => field.id === 'cvv') && (
                        <Input
                            id='cvv'
                            value={cvv}
                            onChange={(value) => handleChangeCvv(value, 'cvv')}
                            label={translations.security_code}
                            type='number'
                            required={true}
                            fieldAttrs={{ step: '1', className: error ? 'error' : '' }}
                        />
                    )}
                </div>
                <Input
                    id='cardholderName'
                    type='text'
                    label={translations.cardholder_name}
                    value={accountOnFile?.getValue('cardholderName') ?? ''}
                    disabled={true}
                    required={true}
                />
                <button className='button primary' type='submit'>
                    {translations.pay_now}
                </button>
            </form>
        </div>
    );
};

export default AccountOnFilePage;
