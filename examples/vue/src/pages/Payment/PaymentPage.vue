<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, toRaw } from 'vue';
import translations from '../../translations/translations.ts';
import Logo from '../../components/Logo/Logo.vue';
import Input from '../../components/FormFields/Input/Input.vue';
import {
    BasicPaymentProducts,
    CommunicationError,
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    type SdkError
} from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import Select from '../../components/FormFields/Select/Select.vue';
import countries from '@shared/constants/countries';
import currencies from '@shared/constants/currencies';
import Checkbox from '../../components/FormFields/Checkbox/Checkbox.vue';
import ProductSelection from '../../components/ProductSelection/ProductSelection.vue';
import AccountOnFileSelection from '../../components/AccountOnFileSelection/AccountOnFileSelection.vue';
import '../../styles/payment-details.css';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import LoaderService from '../../services/LoaderService.ts';

const router = useRouter();
const { redirectToPage } = RouterService(router);

const PaymentContextInitialData = {
    amountOfMoney: {
        amount: 1000,
        currencyCode: 'EUR'
    },
    countryCode: 'BE',
    isRecurring: false
} satisfies PaymentContextWithAmount;

const paymentContextModel: PaymentContextWithAmount = reactive({ ...PaymentContextInitialData });

const session = shallowRef<OnlinePaymentSdk>();
const paymentMethods = ref<BasicPaymentProducts | undefined>();

const isFormExpanded = ref(true);
const errorMessage = ref('');

onMounted(() => {
    const sessionDetails = StorageService.getSessionData();
    const context = StorageService.getPaymentContext();

    if (sessionDetails) {
        session.value = init(sessionDetails);
    }

    if (context) {
        Object.assign(paymentContextModel, context);
    }
});

const amountString = computed({
    get: () => String(paymentContextModel.amountOfMoney.amount ?? ''),
    set: (val: string) => {
        const num = parseInt(val);
        if (!isNaN(num)) {
            paymentContextModel.amountOfMoney.amount = num;
        }
    }
});

const handleSubmit = () => {
    if (
        paymentContextModel?.countryCode &&
        paymentContextModel?.amountOfMoney?.currencyCode &&
        paymentContextModel?.amountOfMoney?.amount
    ) {
        StorageService.setPaymentContext(toRaw(paymentContextModel));
        fetchPaymentProducts(toRaw(paymentContextModel) as PaymentContextWithAmount);
    }
};

const handleUnauthorizedError = (error: SdkError) => {
    if (error instanceof CommunicationError) {
        StorageService.clear();
        redirectToPage('/');
    }
};

const fetchPaymentProducts = (paymentDetails: PaymentContextWithAmount) => {
    LoaderService.show();
    session?.value
        ?.getBasicPaymentProducts(paymentDetails)
        .then((basicProducts) => {
            paymentMethods.value = basicProducts;
            handleExpandCollapse();
        })
        .catch((error: SdkError) => {
            paymentMethods.value = undefined;
            errorMessage.value = error?.message ?? '';
            handleUnauthorizedError(error);
        })
        .finally(() => {
            LoaderService.hide();
        });
};

const setSelectedProduct = async (productId: number) => {
    LoaderService.show();
    const paymentProduct = await session?.value?.getPaymentProduct(productId, toRaw(paymentContextModel));

    if (!paymentProduct) {
        errorMessage.value = translations.payment_product_not_found;
        return;
    }

    StorageService.setPaymentProductId(paymentProduct.id);
    LoaderService.hide();

    return paymentProduct;
};

const handleProductSelection = async (id: number) => {
    const product = await setSelectedProduct(id);

    if (product?.paymentMethod === 'card') {
        redirectToPage('/payment/credit-card');
    } else if (product?.paymentMethod === 'mobile' && product?.label === 'GOOGLEPAY') {
        redirectToPage('/payment/google-pay');
    } else {
        errorMessage.value = translations.this_payment_product_is_not_supported_in_this_demo;
    }
};

const handleAccountOnFileSelection = async (id: string) => {
    const aof = paymentMethods?.value?.accountsOnFile.find((aof) => aof.id === id);

    if (aof) {
        const product = await setSelectedProduct(aof.paymentProductId);

        StorageService.setAccountOnFileId(id);
        if (product?.paymentMethod === 'card') {
            redirectToPage('/payment/account-on-file/');
        } else {
            errorMessage.value = translations.this_demo_supports_only_card_payment_products;
        }
    }
};

const handleExpandCollapse = () => {
    isFormExpanded.value = !isFormExpanded.value;
};
</script>

<template>
    <div class="page">
        <Logo />
        <h1>{{ translations.payment_details }}</h1>
        <p class="text-left">Order details:</p>
        <button
            :class="['button', 'expand-button', { show: !isFormExpanded }]"
            type="button"
            id="paymentDetailsFormExpandButton"
            @click="handleExpandCollapse"
        >
            {{ translations.expand }}
        </button>
        <div class="flex column mt-1">
            <form
                :class="['form', { collapse: !isFormExpanded }]"
                id="paymentDetailsForm"
                @submit.prevent="handleSubmit"
            >
                <Input
                    id="amount"
                    :label="translations.amount_in_the_smallest_denominator"
                    required
                    v-model="amountString"
                    type="number"
                    step="1"
                />
                <Select
                    id="country"
                    :label="translations.country"
                    required
                    v-model="paymentContextModel.countryCode"
                    :options="countries"
                />
                <Select
                    id="currency"
                    :label="translations.currency"
                    required
                    :options="currencies"
                    v-model="paymentContextModel.amountOfMoney.currencyCode"
                />
                <Checkbox
                    id="is-recurring"
                    v-model="paymentContextModel.isRecurring"
                    :label="translations.is_recurring_payment"
                />
                <button class="button primary" type="submit">{{ translations.get_payment_methods }}</button>
            </form>
        </div>
        <div class="flex row">
            <ProductSelection
                v-if="paymentMethods?.paymentProducts.length"
                :products="paymentMethods.paymentProducts"
                @select="(id) => handleProductSelection(id)"
            />
            <AccountOnFileSelection
                v-if="paymentMethods && paymentMethods.accountsOnFile?.length > 0"
                :accounts-on-file="paymentMethods.accountsOnFile"
                @select="(id) => handleAccountOnFileSelection(id)"
            />
        </div>
        <div class="error mt-1" id="errorMessage">{{ errorMessage }}</div>
    </div>
</template>
