import { type FormEvent, memo } from 'react';
import './index.css';
import type { AmountOfMoneyJSON, PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
import Input from '../FormFields/Input/Input.tsx';
import Select from '../FormFields/Select/Select.tsx';
import Checkbox from '../FormFields/Checkbox/Checkbox.tsx';
import countries from '@shared/constants/countries';
import currencies from '@shared/constants/currencies';
import translations from '../../translations/translations.ts';

type Props = {
    paymentContext?: PaymentContextWithAmount;
    isFormExpanded?: boolean;
    onExpandCollapse?: () => void;
    onChangeContextModel?: <K extends keyof PaymentContextWithAmount>(
        value: PaymentContextWithAmount[K],
        prop: K
    ) => void;
    onSaveContextToStorage?: (paymentContext: PaymentContextWithAmount) => void;
};

const PaymentDetails = ({
    paymentContext,
    isFormExpanded,
    onExpandCollapse,
    onChangeContextModel,
    onSaveContextToStorage
}: Props) => {
    const handleSaveContextToStorage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onExpandCollapse?.();

        if (
            paymentContext?.countryCode &&
            paymentContext?.amountOfMoney?.currencyCode &&
            paymentContext?.amountOfMoney?.amount
        ) {
            const newPaymentContext: PaymentContextWithAmount = {
                ...(paymentContext as PaymentContextWithAmount),
                amountOfMoney: { ...paymentContext.amountOfMoney } as AmountOfMoneyJSON
            };

            onSaveContextToStorage?.(newPaymentContext);
        }
    };

    return (
        <div>
            <p className='text-left'></p>
            <button
                className={`button expand-button ${isFormExpanded ? '' : 'show'}`}
                type='button'
                id='paymentDetailsFormExpandButton'
                onClick={onExpandCollapse}
            >
                {translations.expand}
            </button>
            <form
                className={`form ${isFormExpanded ? '' : 'collapse'}`}
                id='paymentDetailsForm'
                onSubmit={handleSaveContextToStorage}
            >
                <Input
                    label={translations.amount_in_the_smallest_denominator}
                    id='amount'
                    type='number'
                    onChange={(value) =>
                        onChangeContextModel?.(
                            {
                                ...paymentContext?.amountOfMoney,
                                amount: value ? Number(value) : undefined
                            } as AmountOfMoneyJSON,
                            'amountOfMoney'
                        )
                    }
                    required={true}
                    fieldAttrs={{ step: '1' }}
                    value={paymentContext?.amountOfMoney?.amount?.toString()}
                />
                <Select
                    label={translations.country}
                    id='countryCode'
                    options={countries}
                    required={true}
                    value={paymentContext?.countryCode}
                    onChange={(value) => onChangeContextModel?.(value, 'countryCode')}
                />
                <Select
                    label={translations.currency}
                    id='currency'
                    options={currencies}
                    required={true}
                    value={paymentContext?.amountOfMoney?.currencyCode}
                    onChange={(value) =>
                        onChangeContextModel?.(
                            {
                                ...paymentContext?.amountOfMoney,
                                currencyCode: value
                            } as AmountOfMoneyJSON,
                            'amountOfMoney'
                        )
                    }
                />
                <Checkbox
                    label={translations.is_recurring_payment}
                    id='isRecurring'
                    onChange={(value) => onChangeContextModel?.(value, 'isRecurring')}
                    checked={paymentContext?.isRecurring}
                />
                <button className='button primary' type='submit'>
                    {translations.get_payment_methods}
                </button>
                <div className='errorMessage' id='paymentDetailsErrorMessage'></div>
            </form>
        </div>
    );
};

export default memo(PaymentDetails);
