import translations from '../../translations/translations.ts';
import { useState } from 'react';
import type { AmountOfMoneyJSON, ErrorResponseJSON, Session } from 'onlinepayments-sdk-client-js';
import { useLoader } from '../Loader/Loader.tsx';

type CardOperations = {
    currencyConversions: string[];
    surcharges: string[];
};

type CardOperationsErrorMessages = {
    surcharges: string[];
    currencyConversions: string[];
};

const CardOperationsInitialState = {
    currencyConversions: [],
    surcharges: []
} satisfies CardOperations;

const CardOperationsErrorInitialState = {
    currencyConversions: [],
    surcharges: []
};

type Props = {
    session: Session | null;
    cardNumber: string;
    cardNumberError: boolean;
    paymentProductId?: number;
    amountOfMoney: AmountOfMoneyJSON;
};
const AdditionalCardOperations = ({ session, cardNumber, cardNumberError, paymentProductId, amountOfMoney }: Props) => {
    const { show, hide } = useLoader();

    const [cardOperations, setCardOperations] = useState<CardOperations>({ ...CardOperationsInitialState });
    const [cardOperationsErrors, setCardOperationsErrors] = useState<CardOperationsErrorMessages>({
        ...CardOperationsErrorInitialState
    });

    const handleClickSurcharge = () => {
        setCardOperationsErrors((prev) => ({
            ...prev,
            surcharges: []
        }));

        if (!cardNumberError && cardNumber.replaceAll(' ', '').length > 0) {
            processSurcharge(cardNumber.replaceAll(' ', ''));
        } else {
            setCardOperationsErrors((prev) => ({
                ...prev,
                surcharges: [...prev.surcharges, translations.please_enter_the_card_number]
            }));
        }
    };

    const processSurcharge = (cardNumber: string) => {
        show();

        session
            ?.getSurchargeCalculation(amountOfMoney, {
                partialCreditCardNumber: cardNumber,
                paymentProductId: paymentProductId
            })
            .then((response) => {
                if (response.surcharges?.length) {
                    response.surcharges.forEach((surcharge, index) => {
                        if (surcharge.result === 'OK') {
                            setCardOperations((prev) => ({
                                ...prev,
                                surcharge: `${index + 1}: ${surcharge.surchargeAmount.amount} ${surcharge.surchargeAmount.currencyCode}`
                            }));
                        }
                    });
                }
            })
            .catch((response: ErrorResponseJSON) => {
                if (response.errors?.length) {
                    const errorMessages: string[] = [];
                    response.errors.forEach((error) => {
                        if (error.message) {
                            errorMessages.push(error.message);
                        }
                    });

                    setCardOperationsErrors((prev) => ({
                        ...prev,
                        surcharges: [...prev.surcharges, ...errorMessages]
                    }));
                }
            })
            .finally(() => {
                hide();
            });
    };

    const handleClickCurrencyConversion = () => {
        setCardOperationsErrors((prev) => ({
            ...prev,
            currencyConversions: []
        }));

        if (!cardNumberError && cardNumber.replaceAll(' ', '').length > 0) {
            processCurrencyConversion(cardNumber.replaceAll(' ', ''));
        } else {
            setCardOperationsErrors((prev) => ({
                ...prev,
                currencyConversions: [...prev.currencyConversions, translations.please_enter_the_card_number]
            }));
        }
    };

    const processCurrencyConversion = (cardNumber: string) => {
        show();

        session
            ?.getCurrencyConversionQuote(amountOfMoney, {
                partialCreditCardNumber: cardNumber,
                paymentProductId: paymentProductId
            })
            .then((response) => {
                if (response.result) {
                    setCardOperations((prev) => ({
                        ...prev,
                        currencyConversions: [
                            ...prev.currencyConversions,
                            `${response.result.result} (${response.result.resultReason})`
                        ]
                    }));
                }

                if (response.proposal?.rate) {
                    setCardOperations((prev) => ({
                        ...prev,
                        currencyConversions: [
                            ...prev.currencyConversions,
                            ` Rate: ${response.proposal.rate.exchangeRate}`
                        ]
                    }));
                }
            })
            .catch((response: ErrorResponseJSON) => {
                if (response.errors?.length) {
                    const errorMessages: string[] = [];
                    response.errors.forEach((error) => {
                        if (error.message) {
                            errorMessages.push(error.message);
                        }
                    });

                    setCardOperationsErrors((prev) => ({
                        ...prev,
                        currencyConversions: [...prev.currencyConversions, ...errorMessages]
                    }));
                }
            })
            .finally(() => {
                hide();
            });
    };

    return (
        <>
            <div className='additional-utils form'>
                <h3 className='m-0'>{translations.currency_conversion}</h3>
                <p className='text-left'>
                    {translations.this_utility_checks_weather_currency_conversion_can_be_applied_for_the_given_card}
                </p>
                <button className='button secondary small' onClick={handleClickCurrencyConversion}>
                    {translations.get_quote}
                </button>
                <div className='text-left error'>
                    {cardOperationsErrors.currencyConversions?.length > 0 &&
                        cardOperationsErrors.currencyConversions.map((currencyConversion, key) => (
                            <div className='text' key={key}>
                                {currencyConversion}
                            </div>
                        ))}
                </div>
                <div className='field'>
                    {cardOperations.currencyConversions?.length > 0 &&
                        cardOperations.currencyConversions.map((currencyConversion, key) => (
                            <div className='text' key={key}>
                                {currencyConversion}
                            </div>
                        ))}
                </div>
            </div>
            <div className='additional-utils form'>
                <h3 className='m-0'>{translations.calculate_surcharge}</h3>
                <p className='text-left'>
                    {translations.this_utility_calculatest_the_surcharge_for_the_given_credit_card_if_enabled}
                </p>
                <button className='button secondary small' onClick={handleClickSurcharge}>
                    {translations.calculate}
                </button>
                <div className='text-left error'>
                    {cardOperationsErrors.surcharges?.length > 0 &&
                        cardOperationsErrors.surcharges.map((surcharge, key) => (
                            <div className='text' key={key}>
                                {surcharge}
                            </div>
                        ))}
                </div>
                <div className='field'>
                    {cardOperations.surcharges?.length > 0 &&
                        cardOperations.surcharges.map((surcharge, key) => (
                            <div className='text' key={key}>
                                {surcharge}
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
};

export default AdditionalCardOperations;
