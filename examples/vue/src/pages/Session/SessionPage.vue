<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import translations from '../../translations/translations.ts';
import { mockApiUrl, useMockApi } from '../../config.ts';
import Logo from '../../components/Logo/Logo.vue';
import Input from '../../components/FormFields/Input/Input.vue';
import { type APIErrorJSON, type ErrorResponseJSON, type SessionDetails } from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import ApiService from '@shared/services/ApiService';
import { useRouter } from 'vue-router';
import RouterService from '../../services/RouterService.ts';
import LoaderService from '../../services/LoaderService.ts';

const router = useRouter();
const { redirectToPage } = RouterService(router);

const SessionDetailsInitialData = {
    clientSessionId: '',
    assetUrl: '',
    customerId: '',
    clientApiUrl: ''
} satisfies SessionDetails;

const sessionDetailsModel: SessionDetails = reactive({ ...SessionDetailsInitialData });

const errorMessage = ref('');

onMounted(() => {
    const sessionDetails = StorageService.getSession();

    if (sessionDetails) {
        Object.assign(sessionDetailsModel, sessionDetails);
    }
});

const handleSubmit = () => {
    if (
        !sessionDetailsModel?.assetUrl ||
        !sessionDetailsModel.clientApiUrl ||
        !sessionDetailsModel.clientSessionId ||
        !sessionDetailsModel.customerId
    ) {
        errorMessage.value = translations.please_fill_in_all_the_data;
    } else {
        StorageService.clear();
        StorageService.setSession(sessionDetailsModel);

        redirectToPage('/payment');
    }
};

const fetchSessionFromAPI = async () => {
    LoaderService.show();
    let message = '';

    ApiService(mockApiUrl)
        .getSession()
        .then((response) => {
            Object.assign(sessionDetailsModel, response);
        })
        .catch((error: ErrorResponseJSON) => {
            if (error?.errors?.length) {
                message =
                    translations.errors_while_fetching_data +
                    error.errors.map((e: APIErrorJSON) => e.message).join(', ');
            } else {
                message = translations.there_was_an_error_fetching_data_did_you_mock_api;
            }
        })
        .finally(() => {
            errorMessage.value = message;
            LoaderService.hide();
        });
};

const pasteData = () => {
    let error = '';

    navigator.clipboard.readText().then((text) => {
        try {
            const data = JSON.parse(text);
            if (data?.assetUrl && data.clientApiUrl && data.clientSessionId && data.customerId) {
                Object.assign(sessionDetailsModel, {
                    assetUrl: data.assetUrl,
                    clientApiUrl: data.clientApiUrl,
                    clientSessionId: data.clientSessionId,
                    customerId: data.customerId
                });
                return;
            }
        } catch {
            error = translations.the_clipboard_does_not_contain_valid_data;
        }
    });
    errorMessage.value = error;
};
</script>

<template>
    <div class="page">
        <Logo />
        <h1>{{ translations.initialize_session }}</h1>
        <p>
            {{
                translations.to_process_the_payment_using_services_provided_by_the_online_payments_platform +
                translations.information_must_be_provided_as_a_merchant
            }}
        </p>
        <div class="flex column mt-1">
            <form class="form" id="sessionForm" @submit.prevent="handleSubmit">
                <Input
                    id="asset-url"
                    :label="translations.asset_url"
                    required
                    v-model="sessionDetailsModel.assetUrl"
                    type="url"
                />
                <Input
                    id="client-api-url"
                    :label="translations.client_api_url"
                    required
                    v-model="sessionDetailsModel.clientApiUrl"
                    type="url"
                />
                <Input
                    id="client-session-id"
                    :label="translations.client_session_id"
                    required
                    v-model="sessionDetailsModel.clientSessionId"
                />
                <Input id="customer-id" label="Customer ID" required v-model="sessionDetailsModel.customerId" />
                <button class="button primary" type="submit">{{ translations.start_session }}</button>
            </form>
            <div class="label">{{ translations.get_session_details_from }}</div>
            <div class="flex row center">
                <button class="button" type="button" @click="pasteData">{{ translations.clipboard }}</button>
                <button v-if="useMockApi" class="button" type="button" @click="fetchSessionFromAPI">
                    {{ translations.mock_api }}
                </button>
            </div>
        </div>
        <div class="error mt-1" id="errorMessage">{{ errorMessage }}</div>
    </div>
</template>
