<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { type ErrorResponseJSON, type PaymentContextWithAmount, Session } from 'onlinepayments-sdk-client-js';
import { mockApiUrl, useMockApi } from '../../config.ts';
import StorageService from '@shared/services/StorageService';
import ApiService from '@shared/services/ApiService';
import { createPaymentApiDocumentationLink, serverToServerDocumentationLink } from '@shared/constants/links';
import LoaderService from '../../services/LoaderService.ts';
import translations from '../../translations/translations';
import type { CardPaymentSpecificData, EncryptedData } from '@shared/types/CreatePaymentRequest';
import Logo from '../../components/Logo/Logo.vue';

type PaymentData = {
    type: 'encrypted' | 'raw';
    data: string;
};

const session = shallowRef<Session>();

const router = useRouter();

const paymentContext = ref<PaymentContextWithAmount>();
const paymentData = ref<PaymentData>();
const paymentResponse = ref<string>('');
const errorMessage = ref<string>('');

const paymentRequest = ref<string>(JSON.stringify(StorageService.getPaymentRequest() ?? '', null, 2));

onMounted(() => {
    const sessionDetails = StorageService.getSession();
    const context = StorageService.getPaymentContext();
    const cardPaymentSpecificData = StorageService.getCardPaymentSpecificData();

    if (sessionDetails) {
        session.value = new Session(sessionDetails);
    }

    if (context) {
        paymentContext.value = context;
    }

    if (cardPaymentSpecificData) {
        paymentData.value = {
            type: 'raw',
            data: JSON.stringify(cardPaymentSpecificData, null, 2)
        };
    } else {
        paymentData.value = {
            type: 'encrypted',
            data: StorageService.getEncryptedData() ?? ''
        };
    }
});

const handleRestartSession = () => {
    StorageService.clear();
    router.push('/');
};

const processPayment = async () => {
    let message = '';

    LoaderService.show();
    ApiService(mockApiUrl)
        .createPayment({
            ...paymentContext.value,
            ...((StorageService.getCardPaymentSpecificData()
                ? ({ ...StorageService.getCardPaymentSpecificData() } as CardPaymentSpecificData)
                : { data: StorageService.getEncryptedData() }) as EncryptedData)
        })
        .then((response) => {
            paymentResponse.value = JSON.stringify(response, null, 2);
        })
        .catch((error: ErrorResponseJSON) => {
            if (error.errors?.length) {
                message =
                    translations.errors_while_fetching_data + error.errors.map((error) => error.message).join(', ');
            } else {
                message = translations.there_was_an_error_fetching_data_did_you_mock_api;
            }
        })
        .finally(() => {
            errorMessage.value = message;
            LoaderService.hide();
        });
};
</script>
<template>
    <div class="page">
        <Logo />
        <h1>{{ translations.complete_payment }}</h1>
        <div class="form">
            <div class="label">{{ translations.payment_request }}</div>
            <textarea
                class="small"
                :rows="10"
                aria-autocomplete="none"
                aria-multiline="true"
                autocapitalize="off"
                autocorrect="off"
                data-enable-grammarly="false"
                data-gramm="false"
                spellcheck="false"
                :value="paymentRequest"
            />
            <template v-if="paymentData">
                <div class="label">
                    {{ paymentData.type === 'raw' ? translations.payload : translations.encrypted_string }}
                </div>
                <textarea
                    class="small"
                    :rows="10"
                    aria-autocomplete="none"
                    aria-multiline="false"
                    autocapitalize="off"
                    autocorrect="off"
                    data-enable-grammarly="false"
                    data-gramm="false"
                    spellcheck="false"
                    :value="paymentData.data"
                />
            </template>
            <button v-if="useMockApi" class="button primary" type="button" @click="processPayment">
                {{ translations.submit_to_mock_api }}
            </button>
            <div class="error">{{ errorMessage }}</div>
            <div v-if="paymentResponse">
                <div class="label">{{ translations.payment_response }}</div>
                <textarea
                    class="small"
                    :rows="10"
                    aria-autocomplete="none"
                    aria-multiline="false"
                    autocapitalize="off"
                    autocorrect="off"
                    data-enable-grammarly="false"
                    data-gramm="false"
                    spellcheck="false"
                    :value="paymentResponse"
                />
            </div>
        </div>
        <button class="button primary mt-1" type="button" @click="handleRestartSession">
            {{ translations.restart_session }}
        </button>
        <div class="flex column start mt-1">
            <span>{{ translations.to_learn_more_about_creating_payment_check_the_following_link }}</span>
            <a class="button link" :href="createPaymentApiDocumentationLink" target="_blank" rel="noopener noreferrer">
                {{ translations.create_payment_api_documentation }}
            </a>
            <a class="button link" :href="serverToServerDocumentationLink" target="_blank" rel="noopener noreferrer">
                {{ translations.server_to_server_integration }}
            </a>
        </div>
    </div>
</template>
