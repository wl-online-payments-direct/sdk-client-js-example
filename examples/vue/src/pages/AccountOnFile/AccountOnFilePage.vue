<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import {
    type AccountOnFile,
    type PaymentContextWithAmount,
    PaymentProduct,
    Session
} from 'onlinepayments-sdk-client-js';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import LoaderService from '../../services/LoaderService.ts';
import Input from '../../components/FormFields/Input/Input.vue';
import Logo from '../../components/Logo/Logo.vue';
import translations from '../../translations/translations.ts';

const router = useRouter();
const { redirectToPage } = RouterService(router);

const cvv = ref('');

const session = shallowRef<Session>();
const paymentContext = shallowRef<PaymentContextWithAmount>();
const paymentProduct = shallowRef<PaymentProduct>();
const accountOnFile = ref<AccountOnFile>();

const errors = computed(() => ({
    cvv: handleValidateField('cvv', cvv.value)
}));

const sessionDetails = StorageService.getSession();
const context = StorageService.getPaymentContext();
const paymentProductJSON = StorageService.getPaymentProduct();
const accountOnFileId = StorageService.getAccountOnFileId();

onMounted(() => {
    LoaderService.show();
    if (sessionDetails) {
        session.value = new Session(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
    }

    if (paymentProductJSON) {
        paymentProduct.value = new PaymentProduct(paymentProductJSON);
    }

    if (accountOnFileId) {
        if (paymentProduct.value) {
            accountOnFile.value = paymentProduct?.value?.accountOnFileById?.[accountOnFileId];
        }
    }

    LoaderService.hide();
});

const handleValidateField = (key: string, value: string) => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value, key, value);

    return !!paymentRequest?.getErrorMessageIds().length;
};

const getCvvMaskedValue = () => {
    const request = PaymentRequestUtility.get(paymentProduct.value, 'cvv', cvv.value);
    cvv.value = request?.getMaskedValue('cvv') ?? cvv.value ?? '';
};

const getExpiryDateMaskedValue = () => {
    const paymentRequest = PaymentRequestUtility.get(
        paymentProduct.value,
        'expiryDate',
        accountOnFile?.value?.attributeByKey?.['expiryDate']?.value
    );

    return (
        paymentRequest?.getMaskedValue('expiryDate') ??
        accountOnFile?.value?.attributeByKey?.['expiryDate']?.value ??
        ''
    );
};

const handleSubmit = () => {
    const paymentRequest = PaymentRequestUtility.get(paymentProduct.value);

    if (cvv.value && paymentProduct?.value?.id) {
        paymentRequest?.setValue('cvv', cvv.value);
    }

    paymentRequest?.setAccountOnFile(accountOnFile.value!);

    if (paymentRequest?.isValid() && accountOnFile.value?.id && cvv.value && paymentProduct?.value?.id) {
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
                disabled
                :model-value="accountOnFile?.getLabel()?.formattedValue"
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
                    v-if="paymentProduct?.json?.fields.find((field) => field.id === 'cvv')"
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
                :model-value="accountOnFile?.attributeByKey['cardholderName']?.value"
            />
            <button class="button primary" type="submit">{{ translations.pay_now }}</button>
        </form>
    </div>
</template>
