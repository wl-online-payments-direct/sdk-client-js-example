<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import {
    type ErrorResponseJSON,
    type PaymentContextWithAmount,
    PaymentProduct,
    Session
} from 'onlinepayments-sdk-client-js';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import LoaderService from '../../services/LoaderService.ts';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import EncryptionService from '@shared/services/EncryptionService';
import Input from '../../components/FormFields/Input/Input.vue';
import Checkbox from '../../components/FormFields/Checkbox/Checkbox.vue';
import Logo from '../../components/Logo/Logo.vue';
import translations from '../../translations/translations.ts';
import AdditionalCardOperations from '../../components/AdditionalCardPaymentOperations/AdditionalCardPaymentOperations.vue';

const router = useRouter();
const { redirectToPage } = RouterService(router);

type CardPaymentModel = {
    cardNumber: string;
    cvv: string;
    cardholderName: string;
    expiryDate: string;
};

const CardPaymentModelInitialState = {
    cardNumber: '',
    cvv: '',
    cardholderName: '',
    expiryDate: ''
} satisfies CardPaymentModel;

const creditCardPaymentModel = reactive({ ...CardPaymentModelInitialState });

const session = shallowRef<Session>();
const paymentContext = shallowRef<PaymentContextWithAmount>();
const paymentProduct = shallowRef<PaymentProduct>();

const isPaymentRecurring = ref(false);
const errorMessage = ref('');

onMounted(() => {
    LoaderService.show();
    const sessionDetails = StorageService.getSession();
    const context = StorageService.getPaymentContext();
    const paymentProductJSON = StorageService.getPaymentProduct();

    if (sessionDetails) {
        session.value = new Session(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
    }

    if (paymentProductJSON) {
        paymentProduct.value = new PaymentProduct(paymentProductJSON);
    }

    LoaderService.hide();
});

const getIinDetails = (cardNumber: string) => {
    return session.value?.getIinDetails(cardNumber.replace(/\s+/g, '').trim(), paymentContext.value).catch(() => null);
};

const errors = computed(() => ({
    cardNumber: handleValidateField('cardNumber', creditCardPaymentModel.cardNumber),
    cvv: handleValidateField('cvv', creditCardPaymentModel.cvv),
    cardholderName: handleValidateField('cardholderName', creditCardPaymentModel.cardholderName),
    expiryDate: handleValidateField('expiryDate', creditCardPaymentModel.expiryDate)
}));

const handleValidateField = (key: string, value: string) => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value, key, value);
    let hasError = false;

    if (paymentRequest?.getErrorMessageIds().length) {
        hasError = true;
    } else {
        hasError = false;
        if (key === 'cardNumber' && value.length > 5) {
            getIinDetails?.(value)?.then((details) => {
                if (!details || details.paymentProductId !== paymentProduct?.value?.id) {
                    hasError = true;
                }
            });
        }
    }

    return hasError;
};

const handleMask = <K extends keyof CardPaymentModel>(key: K, value?: string) => {
    const request = PaymentRequestUtility.get(paymentProduct.value, String(key), value);
    const masked = request?.getMaskedValue(key) ?? value ?? '';

    creditCardPaymentModel[key] = masked as CardPaymentModel[K];
};

const handleSubmit = () => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value);
    paymentRequest?.setTokenize(isPaymentRecurring.value);

    (['cardNumber', 'expiryDate', 'cvv', 'cardholderName'] as (keyof CardPaymentModel)[]).forEach((key) => {
        if (creditCardPaymentModel[key]) {
            paymentRequest?.setValue(key, creditCardPaymentModel[key]);
        }
    });

    if (paymentRequest?.isValid()) {
        getIinDetails?.(creditCardPaymentModel['cardNumber'])
            ?.then((details) => {
                if (details?.paymentProductId !== paymentProduct?.value?.id) {
                    throw Error(
                        `${translations.entered_card_is_not_for} ${paymentProduct?.value?.json.displayHints.label}.`
                    );
                }
                EncryptionService.encrypt(session.value as Session, paymentRequest)
                    .then(() => {
                        StorageService.setPaymentRequest(paymentRequest);
                        redirectToPage('/payment/finalize');
                    })
                    .catch((errors: ErrorResponseJSON) => {
                        errorMessage.value = 'Errors: ' + JSON.stringify(errors);
                    });
            })
            .catch((error: Error) => {
                errors.value.cardNumber = true;
                errorMessage.value = error.message;
            });
    }
};
</script>

<template>
    <div class="page flex column center">
        <Logo />
        <h1 class="m-0">{{ translations.pay_with_a_credit_card }}</h1>
        <p class="self-start m-0">
            <strong
                >Total amount:
                {{
                    paymentContext?.amountOfMoney?.currencyCode &&
                    paymentContext?.amountOfMoney.amount &&
                    NumberFormatter.formatAmount(
                        paymentContext?.amountOfMoney.currencyCode,
                        paymentContext?.amountOfMoney.amount
                    )
                }}
                {{ paymentContext?.amountOfMoney.currencyCode }}</strong
            >
        </p>
        <p class="self-start m-0">
            {{ translations.selected_card_type }} {{ paymentProduct?.json?.displayHints?.label }}
        </p>
        <RouterLink to="/payment" class="button link self-start">
            {{ translations.back_to_payment_method_selection }}
        </RouterLink>
        <form class="form" id="paymentDetailsForm" @submit.prevent="handleSubmit">
            <Input
                id="card-number"
                :label="translations.card_number"
                required
                v-model="creditCardPaymentModel.cardNumber"
                @update:model-value="(value) => handleMask('cardNumber', value)"
                :fieldAttrs="{ className: errors.cardNumber ? 'error' : '' }"
            />
            <div class="flex row">
                <Input
                    id="expiry-date"
                    :label="translations.expiry_date"
                    required
                    v-model="creditCardPaymentModel.expiryDate"
                    @update:model-value="(value) => handleMask('expiryDate', value)"
                    :fieldAttrs="{ className: errors.expiryDate ? 'error' : '' }"
                />
                <Input
                    v-if="paymentProduct?.json?.fields.find((field) => field.id === 'cvv')"
                    id="cvv"
                    :label="translations.security_code"
                    required
                    type="number"
                    v-model="creditCardPaymentModel.cvv"
                    @update:model-value="(value) => handleMask('cvv', value)"
                    :fieldAttrs="{ className: errors.cvv ? 'error' : '' }"
                />
            </div>
            <Input
                id="cardholder-name"
                :label="translations.cardholder_name"
                required
                v-model="creditCardPaymentModel.cardholderName"
                @update:model-value="(value) => handleMask('cardholderName', value)"
                :fieldAttrs="{ className: errors.cardholderName ? 'error' : '' }"
            />
            <Checkbox
                v-if="paymentProduct?.allowsTokenization"
                id="is-recurring"
                v-model="isPaymentRecurring"
                :label="translations.remember_card_for_later_use"
            />
            <button class="button primary" type="submit">{{ translations.pay_now }}</button>
        </form>
        <div id="error" class="error">
            {{ errorMessage }}
        </div>
        <AdditionalCardOperations
            v-if="paymentContext?.amountOfMoney"
            :session="session"
            :card-number="creditCardPaymentModel.cardNumber"
            :card-number-error="errors.cardNumber"
            :amount-of-money="paymentContext?.amountOfMoney"
        />
    </div>
</template>
