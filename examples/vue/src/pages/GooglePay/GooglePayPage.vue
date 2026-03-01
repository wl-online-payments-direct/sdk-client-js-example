<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, toRaw } from 'vue';
import {
    init,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
    PaymentProduct,
    PaymentRequest
} from 'onlinepayments-sdk-client-js';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import LoaderService from '../../services/LoaderService.ts';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import EncryptionService from '@shared/services/EncryptionService';
import translations from '../../translations/translations.ts';
import Logo from '../../components/Logo/Logo.vue';
import PaymentProductService from '@shared/services/PaymentProductService.ts';

declare global {
    interface Window {
        google?: any;
    }
}

const router = useRouter();
const { redirectToPage } = RouterService(router);

const googlePayContainer = ref<HTMLElement | null>(null);

const sdk = shallowRef<OnlinePaymentSdk>();
const paymentProduct = ref<PaymentProduct | null>();

const paymentContext = ref<PaymentContextWithAmount>();

const errorMessage = ref('');

let paymentsClient: any;

const isLoading = ref(true);

const ENVIRONMENT = 'TEST' as const;
const baseRequest = { apiVersion: 2, apiVersionMinor: 0 } as const;
const baseAllowedCardNetworks = ['MASTERCARD', 'VISA'] as const;
const baseAllowedAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'] as const;

const initData = async () => {
    LoaderService.show();
    const sessionDetails = StorageService.getSessionData();
    const productId = StorageService.getPaymentProductId();
    const context = StorageService.getPaymentContext();

    if (sessionDetails) {
        sdk.value = init(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
    }

    if (productId) {
        paymentProduct.value = await PaymentProductService.getPaymentProduct(sdk.value!, Number(productId), context!);
    }

    if (!paymentProduct.value) {
        redirectToPage('/payment');
    }

    if (!window.google?.payments?.api) {
        errorMessage.value = translations.error_loading_google_pay;
        return;
    }

    paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: ENVIRONMENT
    });

    void isGooglePayButtonReady();
    LoaderService.hide();
    isLoading.value = false;
};

onMounted(() => {
    initData().catch((error) => console.log(error));
});

const tokenizationSpecification = computed(() => {
    return {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            gateway: paymentProduct.value?.paymentProduct320SpecificData?.gateway?.trim().toLowerCase() ?? 'gateway',
            gatewayMerchantId: 'DemoMerchant'
        }
    };
});

const getCardPaymentMethod = () => {
    const networks = paymentProduct.value?.paymentProduct320SpecificData?.networks ?? baseAllowedCardNetworks;

    return {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: baseAllowedAuthMethods,
            allowedCardNetworks: networks
        },
        tokenizationSpecification: tokenizationSpecification.value
    };
};

const isGooglePayButtonReady = async () => {
    const baseCardPaymentMethod = {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: baseAllowedAuthMethods,
            allowedCardNetworks: baseAllowedCardNetworks
        }
    };

    try {
        const isReady = await paymentsClient.isReadyToPay({
            ...baseRequest,
            allowedPaymentMethods: [baseCardPaymentMethod]
        });

        if (isReady.result) {
            const button = paymentsClient.createButton({
                onClick: () => handleClick(),
                allowedPaymentMethods: [getCardPaymentMethod()],
                buttonType: 'long',
                buttonColor: 'black'
            });

            if (googlePayContainer.value) {
                googlePayContainer.value.appendChild(button);
            }
        } else {
            errorMessage.value = translations.google_pay_not_ready;
        }
    } catch (error) {
        console.error(error);
    }
};

const getPaymentDataRequest = () => {
    return {
        ...baseRequest,
        allowedPaymentMethods: [getCardPaymentMethod()],
        merchantInfo: {
            merchantName: 'DemoMerchant'
        },
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: NumberFormatter.formatAmountForGooglePay(
                paymentContext.value?.amountOfMoney.currencyCode ?? 'EUR',
                paymentContext.value?.amountOfMoney.amount ?? 1000
            ),
            currencyCode: paymentContext.value?.amountOfMoney.currencyCode,
            countryCode: paymentContext.value?.countryCode
        }
    };
};

const handleClick = async () => {
    try {
        const paymentData = await paymentsClient.loadPaymentData(getPaymentDataRequest());
        const token = paymentData?.paymentMethodData?.tokenizationData?.token;

        if (!paymentProduct.value) {
            errorMessage.value = translations.payment_product_not_found;
            return;
        }

        const paymentRequest = new PaymentRequest(toRaw(paymentProduct.value) as PaymentProduct);
        paymentRequest.setValue('encryptedPaymentData', token);

        if (paymentRequest.validate().isValid && sdk.value) {
            try {
                await EncryptionService.encrypt(sdk.value, paymentRequest);
                StorageService.setPaymentRequest(paymentRequest);
                redirectToPage('/payment/finalize');
            } catch (errors) {
                errorMessage.value = 'Errors: ' + JSON.stringify(errors);
            }
        }
    } catch (err) {
        console.error(err);
    }
};
</script>

<template>
    <div class="page flex column center">
        <Logo />
        <h1 class="m-0">{{ translations.pay_with_google_pay }}</h1>
        <p class="self-start m-0">
            <strong>
                {{ translations.total_amount }}
                {{
                    paymentContext?.amountOfMoney?.currencyCode &&
                    paymentContext?.amountOfMoney.amount &&
                    NumberFormatter.formatAmount(
                        paymentContext.amountOfMoney.currencyCode,
                        paymentContext.amountOfMoney.amount
                    )
                }}
                {{ paymentContext?.amountOfMoney?.currencyCode }}
            </strong>
        </p>
        <RouterLink to="/payment/" class="button link self-start">
            {{ translations.back_to_payment_method_selection }}
        </RouterLink>
        <div
            class="form flex column center m-0"
            :class="{
                form: true,
                flex: true,
                column: true,
                center: true,
                'm-0': true,
                'form-max-height': true,
                invisible: isLoading
            }"
        >
            <div ref="googlePayContainer" class="gpay-container"></div>
            <div v-if="errorMessage" class="error">{{ translations.google_pay_not_ready }}</div>
        </div>
        <div id="error" class="error">{{ errorMessage }}</div>
    </div>
</template>
