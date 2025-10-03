<script lang="ts">
    import { goto } from '$app/navigation';
    import ApiService from '@shared/services/ApiService';
    import StorageService from '@shared/services/StorageService';
    import Logo from '../components/Logo/Logo.svelte';
    import Input from '../components/FormFields/Input/Input.svelte';
    import Loader from '../components/Loader/Loader.svelte';
    import { loader } from '../stores/loader';
    import { translations } from '../translations/translations';
    import { mockApiUrl, useMockApi } from '../config';
    import type { ErrorResponseJSON, SessionDetails } from 'onlinepayments-sdk-client-js';
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';

    let errorMessage: string | undefined;
    let sessionDetails: Partial<SessionDetails> = {};

    onMount(() => {
        sessionDetails = StorageService.getSession() ?? {};
    });

    /**
     * Fetches the current session from the API and updates the local sessionDetails.
     * Shows and hides the loader during the process.
     *
     * @returns {Promise<void>}
     */
    const fetchSessionFromAPI = async (): Promise<void> => {
        loader.show();
        errorMessage = '';

        try {
            sessionDetails = await ApiService(mockApiUrl).getSession();
        } catch (error) {
            const err = error as ErrorResponseJSON;
            if (err.errors?.length) {
                errorMessage =
                    translations.errors_while_fetching_data +
                    err.errors.map((e) => e.message).join(', ');
            } else {
                errorMessage = translations.there_was_an_error_fetching_data_did_you_mock_api;
            }
        } finally {
            loader.hide();
        }
    };

    /**
     * Reads session details from the clipboard and updates sessionDetails.
     *
     * @returns {Promise<void>}
     */
    const pasteData = async (): Promise<void> => {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);

            if (data?.assetUrl && data.clientApiUrl && data.clientSessionId && data.customerId) {
                sessionDetails =
                    {
                        assetUrl: data.assetUrl,
                        clientApiUrl: data.clientApiUrl,
                        clientSessionId: data.clientSessionId,
                        customerId: data.customerId
                    };

                return;
            }
            errorMessage = translations.the_clipboard_does_not_contain_valid_data;
        } catch {
            errorMessage = translations.the_clipboard_does_not_contain_valid_data;
        }
    };

    /**
     * Handles the form submission.
     * Validates session details and stores them in StorageService.
     * Navigates to the payment page if valid.
     *
     * @param {Event} event - The form submission event.
     */
    const handleSubmit = (event: Event): void => {
        event.preventDefault();

        if
        (
            !sessionDetails.assetUrl ||
            !sessionDetails.clientApiUrl ||
            !sessionDetails.clientSessionId ||
            !sessionDetails.customerId
        ) {
            errorMessage = translations.please_fill_in_all_the_data;

            return;
        }

        StorageService.clear();
        StorageService.setSession(sessionDetails as SessionDetails);

        goto(resolve('/payment'));
    };
</script>

<Loader />

<div class="page">
    <Logo />
    <h1>{translations.initialize_session}</h1>
    <p>
        {translations.to_process_the_payment_using_services_provided_by_the_online_payments_platform +
        translations.information_must_be_provided_as_a_merchant}
    </p>

    <div class="flex column mt-1">
        <form class="form" id="sessionForm" on:submit={handleSubmit}>
            <Input
                label={translations.asset_url}
                id="assetUrl"
                type="url"
                required
                bind:value={sessionDetails.assetUrl}
            />
            <Input
                label={translations.client_api_url}
                id="clientApiUrl"
                type="url"
                required
                bind:value={sessionDetails.clientApiUrl}
            />
            <Input
                label={translations.client_session_id}
                id="clientSessionId"
                type="text"
                required
                bind:value={sessionDetails.clientSessionId}
            />
            <Input
                label={translations.customer_id}
                id="customerId"
                type="text"
                required
                bind:value={sessionDetails.customerId}
            />
            <button class="button primary" type="submit">
                {translations.start_session}
            </button>
        </form>

        <div class="label">{translations.get_session_details_from}</div>
        <div class="flex row center">
            <button class="button" type="button" on:click={pasteData}>
                {translations.clipboard}
            </button>
            {#if useMockApi}
                <button class="button" type="button" on:click={fetchSessionFromAPI}>
                    {translations.mock_api}
                </button>
            {/if}
        </div>
    </div>

    {#if errorMessage}
        <div class="error mt-1" id="errorMessage">
            {errorMessage}
        </div>
    {/if}
</div>
