<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, toRaw } from 'vue';
import { type PaymentContextWithAmount, PaymentProduct, PaymentRequest, Session } from 'onlinepayments-sdk-client-js';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import LoaderService from '../../services/LoaderService.ts';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import EncryptionService from '@shared/services/EncryptionService';
import translations from '../../translations/translations.ts';
import Logo from '../../components/Logo/Logo.vue';

declare global {
    interface Window {
        google?: any;
    }
}

const router = useRouter();
const { redirectToPage } = RouterService(router);

const googlePayContainer = ref<HTMLElement | null>(null);

const session = shallowRef<Session>();
const paymentProduct = ref<PaymentProduct>();
const paymentContext = ref<PaymentContextWithAmount>();

const errorMessage = ref('');

let paymentsClient: any;

const ENVIRONMENT = 'TEST' as const;
const baseRequest = { apiVersion: 2, apiVersionMinor: 0 } as const;
const baseAllowedCardNetworks = ['MASTERCARD', 'VISA'] as const;
const baseAllowedAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'] as const;

onMounted(() => {
    LoaderService.show();
    const sessionDetails = StorageService.getSession();
    const productJSON = StorageService.getPaymentProduct();
    const context = StorageService.getPaymentContext();

    if (productJSON) {
        paymentProduct.value = new PaymentProduct(productJSON);
    }

    if (sessionDetails) {
        session.value = new Session(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
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

        const paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentProduct(toRaw(paymentProduct.value) as PaymentProduct);
        paymentRequest.setValue('encryptedPaymentData', token);

        if (paymentRequest.isValid() && session.value) {
            try {
                await EncryptionService.encrypt(session.value as Session, paymentRequest);
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
        <div class="form flex column center m-0">
            <div ref="googlePayContainer" class="gpay-container"></div>
            <div v-if="errorMessage" class="error">{{ translations.google_pay_not_ready }}</div>
        </div>
        <div id="error" class="error">{{ errorMessage }}</div>
    </div>
</template>
