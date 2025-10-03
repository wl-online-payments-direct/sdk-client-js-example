<script setup lang="ts">
import { ref } from 'vue';
import translations from '../../translations/translations.ts';
import type { AmountOfMoneyJSON, ErrorResponseJSON, Session } from 'onlinepayments-sdk-client-js';
import LoaderService from '../../services/LoaderService.ts';

type CardOperations = {
    currencyConversions: string[];
    surcharges: string[];
};

type CardOperationsErrorMessages = {
    currencyConversions: string[];
    surcharges: string[];
};

const CardOperationsInitialState: CardOperations = {
    currencyConversions: [],
    surcharges: []
};

const CardOperationsErrorInitialState: CardOperationsErrorMessages = {
    currencyConversions: [],
    surcharges: []
};

const props = defineProps<{
    session?: Session;
    cardNumber: string;
    cardNumberError: boolean;
    paymentProductId?: number;
    amountOfMoney: AmountOfMoneyJSON;
}>();

const cardOperations = ref<CardOperations>({ ...CardOperationsInitialState });
const cardOperationsErrors = ref<CardOperationsErrorMessages>({
    ...CardOperationsErrorInitialState
});

const normalizedCard = (): string => {
    return (props.cardNumber ?? '').replace(/\s+/g, '').trim();
};

const clearErrors = (key: keyof CardOperationsErrorMessages) => {
    cardOperationsErrors.value[key] = [];
};

const handleClickSurcharge = () => {
    clearErrors('surcharges');

    const card = normalizedCard();
    if (!props.cardNumberError && card.length > 0) {
        processSurcharge(card);
    } else {
        cardOperationsErrors.value.surcharges.push(translations.please_enter_the_card_number);
    }
};

const processSurcharge = async (cardNumber: string) => {
    LoaderService.show();
    try {
        const response = await props.session?.getSurchargeCalculation(props.amountOfMoney, {
            partialCreditCardNumber: cardNumber,
            paymentProductId: props.paymentProductId
        });

        if (response?.surcharges?.length) {
            response.surcharges.forEach((surcharge: any, index: number) => {
                if (surcharge.result === 'OK' && surcharge.surchargeAmount) {
                    cardOperations.value.surcharges.push(
                        `${index + 1}: ${surcharge.surchargeAmount.amount} ${surcharge.surchargeAmount.currencyCode}`
                    );
                }
            });
        }
    } catch (e) {
        const error = e as ErrorResponseJSON;
        if (error?.errors?.length) {
            const errorMessage = error.errors
                .map((error) => error.message)
                .filter((message): message is string => !!message);
            cardOperationsErrors.value.surcharges.push(...errorMessage);
        }
    } finally {
        LoaderService.hide();
    }
};

const handleClickCurrencyConversion = () => {
    clearErrors('currencyConversions');

    const card = normalizedCard();
    if (!props.cardNumberError && card.length > 0) {
        processCurrencyConversion(card);
    } else {
        cardOperationsErrors.value.currencyConversions.push(translations.please_enter_the_card_number);
    }
};

const processCurrencyConversion = async (cardNumber: string) => {
    LoaderService.show();
    try {
        const response = await props.session?.getCurrencyConversionQuote(props.amountOfMoney, {
            partialCreditCardNumber: cardNumber,
            paymentProductId: props.paymentProductId
        });

        if (response?.result) {
            cardOperations.value.currencyConversions.push(
                `${response.result.result} (${response.result.resultReason})`
            );
        }

        if (response?.proposal?.rate?.exchangeRate) {
            cardOperations.value.currencyConversions.push(`Rate: ${response.proposal.rate.exchangeRate}`);
        }
    } catch (e) {
        const error = e as ErrorResponseJSON;
        if (error?.errors?.length) {
            const errorMessages = error.errors
                .map((error) => error.message)
                .filter((message): message is string => !!message);
            cardOperationsErrors.value.currencyConversions.push(...errorMessages);
        }
    } finally {
        LoaderService.hide();
    }
};
</script>

<template>
    <div class="additional-utils form">
        <h3 class="m-0">{{ translations.currency_conversion }}</h3>
        <p class="text-left">
            {{ translations.this_utility_checks_weather_currency_conversion_can_be_applied_for_the_given_card }}
        </p>
        <button class="button secondary small" @click="handleClickCurrencyConversion">
            {{ translations.get_quote }}
        </button>
        <div class="text-left error" v-if="cardOperationsErrors.currencyConversions.length">
            <div
                v-for="(message, index) in cardOperationsErrors.currencyConversions"
                :key="`currency-error-${index}`"
                class="text"
            >
                {{ message }}
            </div>
        </div>
        <div class="field" v-if="cardOperations.currencyConversions.length">
            <div
                v-for="(currencyConversion, index) in cardOperations.currencyConversions"
                :key="`currency-${index}`"
                class="text"
            >
                {{ currencyConversion }}
            </div>
        </div>
    </div>
    <div class="additional-utils form">
        <h3 class="m-0">{{ translations.calculate_surcharge }}</h3>
        <p class="text-left">
            {{ translations.this_utility_calculatest_the_surcharge_for_the_given_credit_card_if_enabled }}
        </p>
        <button class="button secondary small" @click="handleClickSurcharge">
            {{ translations.calculate }}
        </button>
        <div class="text-left error" v-if="cardOperationsErrors.surcharges.length">
            <div
                v-for="(message, index) in cardOperationsErrors.surcharges"
                :key="`surcharge-error-${index}`"
                class="text"
            >
                {{ message }}
            </div>
        </div>
        <div class="field" v-if="cardOperations.surcharges.length">
            <div v-for="(surcharge, index) in cardOperations.surcharges" :key="`surcharge-${index}`" class="text">
                {{ surcharge }}
            </div>
        </div>
    </div>
</template>
