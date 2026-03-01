<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import {
    type AccountOnFile,
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct
} from 'onlinepayments-sdk-client-js';
import { RouterLink, useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import LoaderService from '../../services/LoaderService.ts';
import Input from '../../components/FormFields/Input/Input.vue';
import Logo from '../../components/Logo/Logo.vue';
import translations from '../../translations/translations.ts';
import PaymentProductService from '@shared/services/PaymentProductService.ts';

const router = useRouter();
const { redirectToPage } = RouterService(router);

const cvv = ref('');

const sdk = shallowRef<OnlinePaymentSdk>();
const paymentContext = shallowRef<PaymentContextWithAmount>();
const paymentProduct = shallowRef<PaymentProduct | null>(null);
const accountOnFile = ref<AccountOnFile>();

const dirtyFields = reactive({
    cvv: false
});

const errors = computed(() => ({
    cvv: dirtyFields.cvv ? handleValidateField('cvv', cvv.value) : false
}));

const sessionDetails = StorageService.getSessionData();
const context = StorageService.getPaymentContext();
const productId = StorageService.getPaymentProductId();
const accountOnFileId = StorageService.getAccountOnFileId();

const isLoading = ref(true);

const initData = async () => {
    LoaderService.show();
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
    }

    if (!paymentProduct.value) {
        redirectToPage('/payment');
    }

    if (accountOnFileId) {
        if (paymentProduct.value) {
            accountOnFile.value = paymentProduct?.value?.accountsOnFile.find(
                (aof) => aof.paymentProductId === paymentProduct.value?.id
            );
        }
    }

    isLoading.value = false;
    LoaderService.hide();
};

onMounted(() => {
    initData().catch((error) => console.log(error));
});

const handleValidateField = (key: string, value: string) => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value, key, value);

    return !paymentRequest?.getField(key).validate().isValid;
};

const getCvvMaskedValue = () => {
    const request = PaymentRequestUtility.get(paymentProduct.value, 'cvv', cvv.value);
    cvv.value = request?.getField('cvv').getMaskedValue() ?? cvv.value ?? '';
    dirtyFields['cvv'] = true;
};

const getExpiryDateMaskedValue = () => {
    const paymentRequest = PaymentRequestUtility.get(
        paymentProduct.value,
        'expiryDate',
        accountOnFile?.value?.getValue('expiryDate')
    );

    return (
        paymentRequest?.getField('expiryDate').getMaskedValue() ?? accountOnFile?.value?.getValue('expiryDate') ?? ''
    );
};

const handleSubmit = () => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value);

    if (cvv.value && paymentProduct?.value?.id) {
        paymentRequest?.setValue('cvv', cvv.value);
    }

    paymentRequest?.setAccountOnFile(accountOnFile.value!);

    if (paymentRequest?.validate().isValid && accountOnFile.value?.id && cvv.value && paymentProduct?.value?.id) {
        StorageService.setPaymentRequest(paymentRequest);

        StorageService.setCardPaymentSpecificData({
            token: accountOnFile.value.id,
            cvv: cvv.value,
            paymentProductId: paymentProduct.value.id
        });

        redirectToPage('/payment/finalize');
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
                disabled
                :model-value="accountOnFile?.label"
            />
            <div class="flex row">
                <Input
                    id="expiry-date"
                    :label="translations.expiry_date"
                    required
                    disabled
                    :model-value="getExpiryDateMaskedValue()"
                />
                <Input
                    v-if="paymentProduct?.fields.find((field) => field.id === 'cvv')"
                    id="cvv"
                    :label="translations.security_code"
                    required
                    type="number"
                    v-model="cvv"
                    @update:model-value="() => getCvvMaskedValue()"
                    :fieldAttrs="{ className: errors.cvv ? 'error' : '' }"
                />
            </div>
            <Input
                id="cardholder-name"
                :label="translations.cardholder_name"
                required
                disabled
                :model-value="accountOnFile?.getValue('cardholderName')"
            />
            <button class="button primary" type="submit">{{ translations.pay_now }}</button>
        </form>
    </div>
</template>
