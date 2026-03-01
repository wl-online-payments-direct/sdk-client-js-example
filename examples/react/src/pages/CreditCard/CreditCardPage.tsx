import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct,
    type SdkError,
    type SessionData
} from 'onlinepayments-sdk-client-js';

import { useLoader } from '../../components/Loader/Loader.tsx';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import Logo from '../../components/Logo/Logo.tsx';
import Input from '../../components/FormFields/Input/Input.tsx';
import translations from '../../translations/translations.ts';
import Checkbox from '../../components/FormFields/Checkbox/Checkbox.tsx';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import AdditionalCardOperations from '../../components/AdditionalCardOperations/AdditionalCardOperations.tsx';
import PaymentProductService from '@shared/services/PaymentProductService.ts';
import EncryptionService from '@shared/services/EncryptionService.ts';

type ModelErrors<T> = {
    [K in keyof T]: boolean;
};

type PaymentModel = {
    cardNumber: string;
    cvv: string;
    cardholderName: string;
    expiryDate: string;
};

type PaymentModelErrors = ModelErrors<PaymentModel>;

const PaymentModelInitialState = {
    cardNumber: '',
    cvv: '',
    cardholderName: '',
    expiryDate: ''
} satisfies PaymentModel;

const PaymentModelErrorsInitialState = {
    cardNumber: false,
    cvv: false,
    cardholderName: false,
    expiryDate: false
} satisfies PaymentModelErrors;

const CreditCardPage = () => {
    const navigate = useNavigate();
    const { show, hide } = useLoader();

    const sdk = useRef<OnlinePaymentSdk>(null);

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();
    const [paymentProduct, setPaymentProduct] = useState<PaymentProduct>();

    const [paymentModel, setPaymentModel] = useState<PaymentModel>({ ...PaymentModelInitialState });
    const [modelErrors, setModelErrors] = useState<PaymentModelErrors>({ ...PaymentModelErrorsInitialState });

    const [modelErrorMessage, setModelErrorMessage] = useState('');

    const [isRecurring, setIsRecurring] = useState(false);

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
                    return;
                }
            }

            hide();
            navigate('/payment');
        };

        initData().catch((error) => console.error(error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (paymentProduct) {
            setIsLoading(false);
            hide();
        }
    }, [hide, paymentProduct]);

    const getIinDetails = async (cardNumber: string) => {
        return await sdk.current?.getIinDetails(cardNumber.replace(/\s+/g, '').trim(), paymentContext!);
    };

    const handleChangePaymentModel = <K extends keyof PaymentModel>(prop: K, value: PaymentModel[K]) => {
        const paymentRequest = PaymentRequestUtility.get(paymentProduct, prop, value);

        const maskedValue = paymentRequest?.getField(prop).getMaskedValue();
        let hasError = false;

        if (!paymentRequest?.getField(prop).validate().isValid) {
            hasError = true;
        } else {
            hasError = false;
            if (prop === 'cardNumber' && value.length > 5) {
                getIinDetails?.(value)?.then((details) => {
                    if (!details || details.paymentProductId !== paymentProduct?.id) {
                        hasError = true;
                    }
                });
            }
        }

        setPaymentModel((prev) => ({
            ...prev,
            [prop]: maskedValue
        }));

        setModelErrors((prev) => ({
            ...prev,
            [prop]: hasError
        }));
    };

    const handleProcessPayment = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const paymentRequest = PaymentRequestUtility.get(paymentProduct);
        paymentRequest?.setTokenize(isRecurring);

        (['cardNumber', 'expiryDate', 'cvv', 'cardholderName'] as (keyof PaymentModel)[]).forEach((key) => {
            if (paymentModel[key]) {
                paymentRequest?.setValue(key, paymentModel[key]);
            }
        });

        if (paymentRequest?.validate().isValid) {
            getIinDetails?.(paymentModel['cardNumber'])
                ?.then((details) => {
                    if (details?.paymentProductId !== paymentProduct?.id) {
                        throw Error(`${translations.entered_card_is_not_for} ${paymentProduct?.label}`);
                    }

                    EncryptionService.encrypt(sdk.current as OnlinePaymentSdk, paymentRequest)
                        .then(() => {
                            StorageService.setPaymentRequest(paymentRequest);
                            navigate('/payment/finalize');
                        })
                        .catch((error: SdkError) => {
                            setModelErrorMessage(error.message + ' ' + JSON.stringify(error.metadata));
                        });
                })
                .catch((error: SdkError) => {
                    setModelErrors((prev) => ({
                        ...prev,
                        cardNumber: true
                    }));

                    setModelErrorMessage(error.message);
                });
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
                        paymentContext.amountOfMoney.amount &&
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
            <form className={`form form-max-height ${isLoading ? 'invisible' : ''}`} onSubmit={handleProcessPayment}>
                <Input
                    id='cardNumber'
                    type='text'
                    label={translations.card_number}
                    value={paymentModel.cardNumber}
                    onChange={(value) => handleChangePaymentModel('cardNumber', value)}
                    required={true}
                    fieldAttrs={{ className: modelErrors['cardNumber'] ? 'error' : '' }}
                />
                <div className='flex row'>
                    <Input
                        id='expiryDate'
                        type='text'
                        label={translations.expiry_date}
                        value={paymentModel.expiryDate}
                        onChange={(value) => handleChangePaymentModel('expiryDate', value)}
                        required={true}
                        fieldAttrs={{ className: modelErrors['expiryDate'] ? 'error' : '' }}
                    />
                    {paymentProduct?.fields.find((field) => field.id === 'cvv') && (
                        <Input
                            id='cvv'
                            value={paymentModel.cvv}
                            onChange={(value) => handleChangePaymentModel('cvv', value)}
                            label={translations.security_code}
                            type='number'
                            required={true}
                            fieldAttrs={{ className: modelErrors['cvv'] ? 'error' : '' }}
                        />
                    )}
                </div>
                <Input
                    id='cardholderName'
                    type='text'
                    label={translations.cardholder_name}
                    value={paymentModel.cardholderName}
                    onChange={(value) => handleChangePaymentModel('cardholderName', value)}
                    required={true}
                    fieldAttrs={{ className: modelErrors['cardholderName'] ? 'error' : '' }}
                />
                {paymentProduct?.allowsTokenization && (
                    <Checkbox
                        id='tokenize'
                        label={translations.remember_card_for_later_use}
                        checked={isRecurring}
                        onChange={() => setIsRecurring((prev) => !prev)}
                    />
                )}
                <button className='button primary' type='submit'>
                    {translations.pay_now}
                </button>
            </form>
            <div id='error' className='error'>
                {modelErrorMessage}
            </div>
            {paymentContext?.amountOfMoney && (
                <AdditionalCardOperations
                    sdk={sdk.current}
                    cardNumber={paymentModel.cardNumber}
                    cardNumberError={modelErrors['cardNumber']}
                    amountOfMoney={paymentContext.amountOfMoney}
                />
            )}
        </div>
    );
};

export default CreditCardPage;
