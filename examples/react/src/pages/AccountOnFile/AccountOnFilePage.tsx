import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoader } from '../../components/Loader/Loader.tsx';
import type { AccountOnFile, PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
import { PaymentProduct } from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import Logo from '../../components/Logo/Logo.tsx';
import Input from '../../components/FormFields/Input/Input.tsx';
import translations from '../../translations/translations.ts';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';

const AccountOnFilePage = () => {
    const navigate = useNavigate();
    const { show, hide } = useLoader();

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();
    const [paymentProduct, setPaymentProduct] = useState<PaymentProduct>();

    const [accountOnFile, setAccountOnFile] = useState<AccountOnFile>();
    const [cvv, setCvv] = useState<string>();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        show();
        if (!StorageService.getSession()) {
            hide();
            navigate('/');
        }

        if (!StorageService.getAccountOnFileId() || !StorageService.getPaymentProduct()) {
            hide();
            navigate(`/payment/`);
        }

        const product = new PaymentProduct(StorageService.getPaymentProduct()!);
        setPaymentProduct({ ...product } as PaymentProduct);

        hide();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!paymentProduct) {
            return;
        }

        if (StorageService.getPaymentContext()) {
            setPaymentContext(StorageService.getPaymentContext()!);
        }

        setAccountOnFile(paymentProduct?.accountOnFileById?.[StorageService.getAccountOnFileId()!]);
    }, [paymentProduct]);

    const handleChangeCvv = (value: string, key: string) => {
        const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, value);

        const maskedCvv = paymentRequest?.getMaskedValue(key);
        if (paymentRequest?.getErrorMessageIds()?.length) {
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
            accountOnFile?.attributeByKey?.['expiryDate']?.value
        );

        return paymentRequest?.getMaskedValue('expiryDate') ?? '';
    };

    const handleProcessPayment = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const paymentRequest = PaymentRequestUtility.get(paymentProduct, 'cvv', cvv)!;
        accountOnFile && paymentRequest.setAccountOnFile(accountOnFile);

        if (paymentRequest.isValid() && accountOnFile && cvv && paymentProduct?.id) {
            StorageService.setPaymentRequest(paymentRequest);

            StorageService.setCardPaymentSpecificData({
                token: accountOnFile.id,
                cvv: cvv,
                paymentProductId: paymentProduct.id
            });

            navigate('/payment/finalize/');
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
                {translations.selected_card_type} {paymentProduct?.json?.displayHints?.label}
            </p>
            <Link to='/payment' className='button link self-start'>
                {translations.back_to_payment_method_selection}
            </Link>
            <form className='form' id='creditCardForm' onSubmit={handleProcessPayment}>
                <Input
                    id='cardNumber'
                    type='text'
                    label={translations.card_number}
                    value={accountOnFile?.getLabel()?.formattedValue ?? ''}
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
                    {paymentProduct?.json?.fields.find((field) => field.id === 'cvv') && (
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
                    value={accountOnFile?.attributeByKey['cardholderName']?.value ?? ''}
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
