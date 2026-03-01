<script lang="ts">
    import { translations } from '../../translations/translations';
    import type {
        AmountOfMoney,
        OnlinePaymentSdk,
        SdkError
    } from 'onlinepayments-sdk-client-js';
    import { loader } from '../../stores/loader';
    import ErrorService from '@shared/services/ErrorService';

    export let sdk: OnlinePaymentSdk | null = null;
    export let cardNumber: string = '';
    export let cardNumberError: boolean = false;
    export let paymentProductId: number | undefined = undefined;
    export let amountOfMoney: AmountOfMoney | undefined = undefined;

    let cardOperations = {
        currencyConversions: [] as string[],
        surcharges: [] as string[]
    };

    let cardOperationsErrors = {
        currencyConversions: [] as string[],
        surcharges: [] as string[]
    };

    /**
     * Removes all spaces from the card number.
     * @param number - Raw card number
     * @returns Sanitized card number
     */
    const sanitizeCardNumber = (number: string) => number.replaceAll(' ', '');

    /**
     * Process currency conversion using SDK session
     * @param cardNum - sanitized card number
     */
    const processCurrencyConversion = async (cardNum: string) => {
        if (!sdk) {
            return;
        }

        loader.show();

        try {
            const response = await sdk.getCurrencyConversionQuote(amountOfMoney!, {
                partialCreditCardNumber: cardNum,
                paymentProductId
            });

            if (response.result) {
                cardOperations = {
                    ...cardOperations,
                    currencyConversions: [
                        ...cardOperations.currencyConversions,
                        `${response.result.result} (${response.result.resultReason})`
                    ]
                };
            }

            if (response.proposal?.rate) {
                cardOperations = {
                    ...cardOperations,
                    currencyConversions: [
                        ...cardOperations.currencyConversions,
                        `Rate: ${response.proposal.rate.exchangeRate}`
                    ]
                };
            }
        } catch (err) {
            const error = err as SdkError;
            const errorMessages  = ErrorService.extractErrorMessages(error)
            if (errorMessages?.length) {
                cardOperationsErrors = {
                    ...cardOperationsErrors,
                    currencyConversions: [...cardOperationsErrors.currencyConversions, ...errorMessages]
                };
            }
        } finally {
            loader.hide();
        }
    };

    /** Handle click on the "Currency Conversion" button */
    const handleClickCurrencyConversion = async () => {
        cardOperationsErrors = { ...cardOperationsErrors, currencyConversions: [] };
        cardOperations = { ...cardOperations, currencyConversions: [] };

        const sanitized = sanitizeCardNumber(cardNumber);

        if (!cardNumberError && sanitized.length > 0) {
            await processCurrencyConversion(sanitized);
        } else {
            cardOperationsErrors = {
                ...cardOperationsErrors,
                currencyConversions: [translations.please_enter_the_card_number]
            };
        }
    };

    /**
     * Process surcharge using SDK session
     * @param cardNum - sanitized card number
     */
    const processSurcharge = async (cardNum: string) => {
        if (!sdk) {
            return;
        }

        loader.show();

        try {
            const response = await sdk.getSurchargeCalculation(amountOfMoney!, {
                partialCreditCardNumber: cardNum,
                paymentProductId
            });

            if (response.surcharges?.length) {
                const surcharges = response.surcharges
                    .filter(s => s.result === 'OK')
                    .map((s, index) => `${index + 1}: ${s.surchargeAmount.amount} ${s.surchargeAmount.currencyCode}`);

                cardOperations = { ...cardOperations, surcharges };
            }
        } catch (err) {
            const error = err as SdkError;
            const errorMessages = ErrorService.extractErrorMessages(error);

            if (errorMessages?.length) {
                cardOperationsErrors = {
                    ...cardOperationsErrors,
                    surcharges: [...cardOperationsErrors.surcharges, ...errorMessages]
                };
            }
        } finally {
            loader.hide();
        }
    };

    /** Handle click on the "Surcharge" button */
    const handleClickSurcharge = async () => {
        cardOperationsErrors = { ...cardOperationsErrors, surcharges: [] };
        cardOperations = { ...cardOperations, surcharges: [] };

        const sanitized = sanitizeCardNumber(cardNumber);

        if (!cardNumberError && sanitized.length > 0) {
            await processSurcharge(sanitized);
        } else {
            cardOperationsErrors = {
                ...cardOperationsErrors,
                surcharges: [translations.please_enter_the_card_number]
            };
        }
    };
</script>

<div class="additional-utils form">
    <h3 class="m-0">{translations.currency_conversion}</h3>
    <p class="text-left">{translations.this_utility_checks_weather_currency_conversion_can_be_applied_for_the_given_card}</p>
    <button class="button secondary small" on:click={handleClickCurrencyConversion}>
        {translations.get_quote}
    </button>

    {#each cardOperationsErrors.currencyConversions as msg, i (i)}
        <div class="text error">{msg}</div>
    {/each}

    {#each cardOperations.currencyConversions as msg, i (i)}
        <div class="text">{msg}</div>
    {/each}
</div>

<div class="additional-utils form">
    <h3 class="m-0">{translations.calculate_surcharge}</h3>
    <p class="text-left">{translations.this_utility_calculatest_the_surcharge_for_the_given_credit_card_if_enabled}</p>
    <button class="button secondary small" on:click={handleClickSurcharge}>
        {translations.calculate}
    </button>

    {#each cardOperationsErrors.surcharges as msg, i (i)}
        <div class="text error">{msg}</div>
    {/each}

    {#each cardOperations.surcharges as msg, i (i)}
        <div class="text">{msg}</div>
    {/each}
</div>
