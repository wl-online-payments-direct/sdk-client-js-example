<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import {
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct,
    type SdkError
} from 'onlinepayments-sdk-client-js';
import { RouterLink, useRouter } from 'vue-router';
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
import PaymentProductService from '@shared/services/PaymentProductService.ts';

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

const sdk = shallowRef<OnlinePaymentSdk>();
const paymentContext = shallowRef<PaymentContextWithAmount>();
const paymentProduct = ref<PaymentProduct | null>();

const isPaymentRecurring = ref(false);
const errorMessage = ref('');

const isLoading = ref(true);

const initData = async () => {
    LoaderService.show();
    const sessionDetails = StorageService.getSessionData();
    const context = StorageService.getPaymentContext();
    const productId = StorageService.getPaymentProductId();

    if (sessionDetails) {
        sdk.value = init(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
    }

    if (productId) {
        paymentProduct.value = await PaymentProductService.getPaymentProduct(
            sdk.value!,
            productId,
            paymentContext.value!
        );
    } else {
        redirectToPage('/payment');
    }

    isLoading.value = false;
    LoaderService.hide();
};

onMounted(() => {
    initData().catch((error) => console.log(error));
});

const getIinDetails = (cardNumber: string) => {
    return sdk.value?.getIinDetails(cardNumber.replace(/\s+/g, '').trim(), paymentContext.value!).catch(() => null);
};

const dirtyFields = reactive({
    cardNumber: false,
    cvv: false,
    cardholderName: false,
    expiryDate: false
});

const errors = computed(() => ({
    cardNumber: dirtyFields.cardNumber ? handleValidateField('cardNumber', creditCardPaymentModel.cardNumber) : false,
    cvv: dirtyFields.cvv ? handleValidateField('cvv', creditCardPaymentModel.cvv) : false,
    cardholderName: dirtyFields.cardholderName
        ? handleValidateField('cardholderName', creditCardPaymentModel.cardholderName)
        : false,
    expiryDate: dirtyFields.expiryDate ? handleValidateField('expiryDate', creditCardPaymentModel.expiryDate) : false
}));

const handleValidateField = (key: string, value: string) => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value, key, value);
    let hasError = false;

    if (!paymentRequest?.getField(key).validate().isValid) {
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
    const masked = request?.getField(key).getMaskedValue() ?? value ?? '';

    dirtyFields[key] = true;

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

    if (paymentRequest?.validate().isValid) {
        getIinDetails?.(creditCardPaymentModel['cardNumber'])
            ?.then((details) => {
                if (details?.paymentProductId !== paymentProduct?.value?.id) {
                    throw Error(`${translations.entered_card_is_not_for} ${paymentProduct?.value?.label}.`);
                }
                EncryptionService.encrypt(sdk.value as OnlinePaymentSdk, paymentRequest)
                    .then(() => {
                        StorageService.setPaymentRequest(paymentRequest);
                        redirectToPage('/payment/finalize');
                    })
                    .catch((errors: SdkError) => {
                        errorMessage.value = 'Errors: ' + JSON.stringify(errors.metadata);
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
        <p class="self-start m-0">{{ translations.selected_card_type }} {{ paymentProduct?.label }}</p>
        <RouterLink to="/payment" class="button link self-start">
            {{ translations.back_to_payment_method_selection }}
        </RouterLink>
        <form :class="{ form: true, 'form-max-height': true, invisible: isLoading }" @submit.prevent="handleSubmit">
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
                    v-if="paymentProduct?.fields.find((field) => field.id === 'cvv')"
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
            :sdk="sdk"
            :card-number="creditCardPaymentModel.cardNumber"
            :card-number-error="errors.cardNumber"
            :amount-of-money="paymentContext?.amountOfMoney"
        />
    </div>
</template>
