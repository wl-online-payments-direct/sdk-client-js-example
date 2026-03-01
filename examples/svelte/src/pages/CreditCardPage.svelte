<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Logo from '../components/Logo/Logo.svelte';
    import Input from '../components/FormFields/Input/Input.svelte';
    import Checkbox from '../components/FormFields/Checkbox/Checkbox.svelte';
    import AdditionalCardOperations from '../components/AdditionalCardOperations/AdditionalCardOperations.svelte';
    import StorageService from '@shared/services/StorageService';
    import NumberFormatter from '@shared/utilities/NumberFormatter';
    import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
    import EncryptionService from '@shared/services/EncryptionService';
    import { translations } from '../translations/translations';
    import {
        type PaymentContextWithAmount,
        PaymentProduct,
        type OnlinePaymentSdk,
        init
    } from 'onlinepayments-sdk-client-js';
    import { loader } from '../stores/loader';
    import { resolve } from '$app/paths';
    import PaymentProductService from '@shared/services/PaymentProductService';
    import Loader from '../components/Loader/Loader.svelte';

    let sdk: OnlinePaymentSdk | null = null;
    let paymentProduct: PaymentProduct | null = null;
    let paymentContext: PaymentContextWithAmount | undefined;

    let paymentModel = {
        cardNumber: '',
        cvv: '',
        cardholderName: '',
        expiryDate: ''
    };

    let modelErrors = {
        cardNumber: false,
        cvv: false,
        cardholderName: false,
        expiryDate: false
    };

    let modelErrorMessage = '';
    let isRecurring = false;
    let isLoading = true;

    const initData = async () => {
        loader.show();
        const sessionDetails = StorageService.getSessionData();
        const productId = StorageService.getPaymentProductId();
        const contextData = StorageService.getPaymentContext();

        if (!sessionDetails || !contextData) {
            goto(resolve('/'));

            return;
        }

        if(!productId){
            goto(resolve('/payment'));

            return;
        }

        paymentContext = contextData as PaymentContextWithAmount;

        sdk = init(sessionDetails);

        if (productId) {
            paymentProduct = await PaymentProductService.getPaymentProduct(
                sdk,
                productId,
                paymentContext
            );

            if (paymentProduct) {
                loader.hide();
                isLoading = false;

                return;
            }
        }


        loader.hide();
        goto(resolve('/payment'));
    }

    onMount(() => {
        initData().catch(error => console.log(error))
    });

    /**
     * Retrieves IIN (Issuer Identification Number) details for a given card number.
     * @param cardNumber - The full or partial credit card number.
     * @returns A Promise resolving to the IIN details or null if unavailable.
     */
    const getIinDetails = async (cardNumber: string) => {
        try {
            return await sdk!.getIinDetails(cardNumber.replace(/\s+/g, '').trim(), paymentContext!);
        } catch (e) {
            console.log(e)
            return null;
        }
    };

    /**
     * Validates a single field of the credit card form.
     * Uses the PaymentRequestUtility to perform validation and checks IIN details for card number.
     * @param key - The key of the field in paymentModel ('cardNumber' | 'cvv' | 'cardholderName' | 'expiryDate').
     * @param value - The value of the field to validate.
     * @returns `true` if there is a validation error, otherwise `false`.
     */
    const validateField = (key: keyof typeof paymentModel, value: string): boolean => {
        let error = false;
        const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, value);

        if (!paymentRequest) {
            return false;
        }

        if (!paymentRequest.getField(key).validate().isValid) {
            error = true;
        } else {
            error = false;
            if (key === 'cardNumber' && value.length > 5) {
                getIinDetails(value).then((details) => {
                    if (!details || details.paymentProductId !== paymentProduct?.id) {
                        error = true;
                    }
                });
            }
        }

        return error;
    };

    /**
     * Masks the value of a payment field using the PaymentRequest utility and updates the model.
     * @param key - The key of the field to mask.
     * @param value - The value to mask and set.
     */
    const handleMask = <K extends keyof typeof paymentModel>(key: K, value: string) => {
        const paymentRequest = PaymentRequestUtility.get(paymentProduct, key, value);

        if (!paymentRequest) {
            return;
        }

        paymentRequest.setValue(key, value);
        const maskedValue = paymentRequest.getField(key).getMaskedValue() ?? value;
        paymentModel = { ...paymentModel, [key]: maskedValue };
    };

    const handleMaskedInputChange = <K extends keyof typeof paymentModel> (key: K, e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        handleMask(key, value);

        modelErrors[key] = validateField(key, value)
    }

    /**
     * Handles submission of the credit card payment form.
     * Encrypts the payment request and stores it, then navigates to the finalize payment page.
     * @param event - The Submit event of the form.
     */
    const handleProcessPayment = async (event: Event) => {
        event.preventDefault();
        const paymentRequest = PaymentRequestUtility.get(paymentProduct);
        paymentRequest!.setTokenize(isRecurring);

        if (!paymentProduct || !sdk || !paymentRequest) {
            return;
        }

        (['cardNumber', 'expiryDate', 'cvv', 'cardholderName'] as const).forEach((key) => {
            paymentRequest.setValue(key, paymentModel[key]);
        });

        if (paymentRequest.validate().isValid) {
            try {
                await EncryptionService.encrypt(sdk, paymentRequest);
                StorageService.setPaymentRequest(paymentRequest);

                await goto(resolve('/payment/finalize'));
            } catch (err: unknown) {
                const error = err as { message?: string; errors?: unknown };
                modelErrorMessage = error.errors
                    ? 'Errors: ' + JSON.stringify(error.errors)
                    : error.message ?? 'Unknown error';
                if (!modelErrors.cardNumber) {
                    modelErrors.cardNumber = true;
                }
            }
        }
    };
</script>

<Loader />

<div class="page flex column center">
    <Logo />
    <h1 class="m-0">{translations.pay_with_a_credit_card}</h1>

    <p class="self-start m-0">
        <strong>
            {translations.total_amount}
            {#if paymentContext?.amountOfMoney}
                {NumberFormatter.formatAmount(paymentContext.amountOfMoney.currencyCode, paymentContext.amountOfMoney.amount)}
                {paymentContext.amountOfMoney.currencyCode}
            {/if}
        </strong>
    </p>

    <p class="self-start m-0">
        {translations.selected_card_type} {paymentProduct?.label}
    </p>

    <a class="button link self-start" href={resolve('/payment')}>{translations.back_to_payment_method_selection}</a>

    <form  class="form form-max-height {isLoading ? 'invisible' : ''}"  on:submit|preventDefault={handleProcessPayment}>
        <Input
            id="cardNumber"
            type="text"
            label={translations.card_number}
            bind:value={paymentModel.cardNumber}
            on:input={(e) => handleMaskedInputChange('cardNumber', e)}
            required
            fieldAttrs={{ class: modelErrors.cardNumber ? 'error' : '' }}
        />

        <div class="flex row">
            <Input
                id="expiryDate"
                type="text"
                label={translations.expiry_date}
                bind:value={paymentModel.expiryDate}
                on:input={(e) => handleMaskedInputChange('expiryDate', e)}
                required
                fieldAttrs={{ class: modelErrors.expiryDate ? 'error' : '' }}
            />

            {#if paymentProduct?.fields.find(f => f.id === 'cvv')}
                <Input
                    id="cvv"
                    type="text"
                    label={translations.security_code}
                    bind:value={paymentModel.cvv}
                    on:input={(e) => handleMaskedInputChange('cvv', e)}
                    required
                    fieldAttrs={{ step: '1', class: modelErrors.cvv ? 'error' : '' }}
                />
            {/if}
        </div>

        <Input
            id="cardholderName"
            type="text"
            label={translations.cardholder_name}
            bind:value={paymentModel.cardholderName}
            on:input={(e) => handleMaskedInputChange('cardholderName', e)}
            required
            fieldAttrs={{ class: modelErrors.cardholderName ? 'error' : '' }}
        />

        {#if paymentProduct?.allowsTokenization}
            <Checkbox
                id="tokenize"
                label={translations.remember_card_for_later_use}
                bind:checked={isRecurring}
            />
        {/if}

        <button class="button primary" type="submit">{translations.pay_now}</button>
    </form>

    {#if modelErrorMessage}
        <div id="error" class="error">{modelErrorMessage}</div>
    {/if}

    <AdditionalCardOperations
        {sdk}
        cardNumber={paymentModel.cardNumber}
        cardNumberError={modelErrors.cardNumber}
        amountOfMoney={paymentContext?.amountOfMoney}
    />
</div>
