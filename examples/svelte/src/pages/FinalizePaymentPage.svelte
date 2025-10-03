<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Logo from '../components/Logo/Logo.svelte';
    import Loader from '../components/Loader/Loader.svelte';
    import { loader } from '../stores/loader';
    import StorageService from '@shared/services/StorageService';
    import ApiService from '@shared/services/ApiService';
    import { mockApiUrl, useMockApi } from '../config';
    import { translations } from '../translations/translations';
    import { createPaymentApiDocumentationLink, serverToServerDocumentationLink } from '@shared/constants/links';
    import { type PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
    import type { CardPaymentSpecificData, CreatePaymentRequest } from '@shared/types/CreatePaymentRequest';
    import { resolve } from '$app/paths';

    type PaymentData = { type: 'encrypted' | 'raw'; data: string };

    let paymentContext: PaymentContextWithAmount | null = null;
    let paymentData: PaymentData | null = null;
    let paymentRequest: string = '';
    let paymentResponse: string = '';
    let errorMessage = '';

    onMount(() => {
        const paymentRequestData = StorageService.getPaymentRequest();
        const encryptedData = StorageService.getEncryptedData();
        const cardPaymentSpecificData = StorageService.getCardPaymentSpecificData();

        if (!paymentRequestData && !encryptedData && !cardPaymentSpecificData) {
            goto(resolve('/payment/'));

            return;
        }

        paymentRequest = paymentRequestData ? JSON.stringify(paymentRequestData, null, 2) : '';

        if (cardPaymentSpecificData) {
            paymentData = { type: 'raw', data: JSON.stringify(cardPaymentSpecificData, null, 2) };
        } else {
            paymentData = { type: 'encrypted', data: encryptedData ?? '' };
        }

        if (StorageService.getPaymentContext()) {
            paymentContext = StorageService.getPaymentContext()!;
        }
    });

    /**
     * Sends the payment request to the API.
     * Determines whether to use encrypted data or raw card-specific data.
     * Updates the paymentResponse or errorMessage based on API response.
     */
    const processPayment = async (): Promise<void> => {
        errorMessage = '';
        paymentResponse = '';
        loader.show();

        const cardSpecific = StorageService.getCardPaymentSpecificData() as CardPaymentSpecificData | null;
        const accountOnFileId = StorageService.getAccountOnFileId();
        const encryptedData = StorageService.getEncryptedData();

        try {
            let payload: CreatePaymentRequest =
                cardSpecific && accountOnFileId
                    ? { ...cardSpecific, paymentContext: paymentContext ?? undefined }
                    : { data: encryptedData ?? '', paymentContext: paymentContext ?? undefined };

            const response = await ApiService(mockApiUrl).createPayment(payload);
            paymentResponse = JSON.stringify(response, null, 2);
        } catch (err: unknown) {
            const apiError = err as { errors?: { message: string }[] } | undefined;

            if (apiError?.errors?.length) {
                errorMessage =
                    translations.errors_while_fetching_data +
                    apiError.errors.map((e) => e.message).join(', ');
            } else {
                errorMessage =
                    translations.there_was_an_error_fetching_data_did_you_mock_api;
            }
        } finally {
            loader.hide();
        }
    };

    /**
     * Restarts the session by clearing all stored data and navigating back to the home page.
     */
    const handleRestartSession = async (): Promise<void> => {
        StorageService.clear();

        await goto(resolve('/'));
    };
</script>

<Loader />

<div class="page">
    <Logo />
    <h1>{translations.complete_payment}</h1>

    <div class="form">
        <div class="label">{translations.payment_request}</div>
        <textarea
            class="small"
            rows="10"
            spellcheck="false"
            readonly
        >{paymentRequest}</textarea>

        {#if paymentData}
            <div class="label">
                {paymentData.type === 'raw' ? 'Payload' : translations.encrypted_string}
            </div>
            <textarea
                class="small"
                rows="10"
                spellcheck="false"

            >{paymentData.data}</textarea>
        {/if}

        {#if useMockApi}
            <button class="button primary" type="button" on:click={processPayment}>
                {translations.submit_to_mock_api}
            </button>
        {/if}

        {#if errorMessage}
            <div class="error">{errorMessage}</div>
        {/if}

        {#if paymentResponse}
            <div>
                <div class="label">{translations.payment_response}</div>
                <textarea
                    class="small"
                    rows="10"
                    spellcheck="false"
                    readonly
                >{paymentResponse}</textarea>
            </div>
        {/if}
    </div>

    <button class="button primary mt-1" type="button" on:click={handleRestartSession}>
        {translations.restart_session}
    </button>

    <div class="flex column start mt-1">
        <span>{translations.to_learn_more_about_creating_payment_check_the_following_link}</span>
        <a class="button link" href={resolve(createPaymentApiDocumentationLink)} target="_blank"
           rel="noopener noreferrer">
            {translations.create_payment_api_documentation}
        </a>
        <a class="button link" href={resolve(serverToServerDocumentationLink)} target="_blank"
           rel="noopener noreferrer">
            {translations.server_to_server_integration}
        </a>
    </div>
</div>
