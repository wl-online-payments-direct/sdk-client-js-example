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
    import { type PaymentContextWithAmount, PaymentProduct, Session } from 'onlinepayments-sdk-client-js';
    import { loader } from '../stores/loader';
    import { resolve } from '$app/paths';

    let session: Session | null = null;
    let paymentProduct: PaymentProduct;
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

    onMount(() => {
        loader.show();
        const sessionDetails = StorageService.getSession();
        const productData = StorageService.getPaymentProduct();
        const contextData = StorageService.getPaymentContext();

        if (!sessionDetails || !productData) {
            goto(resolve('/'));

            return;
        }

        session = new Session(sessionDetails);
        paymentProduct = new PaymentProduct(productData);
        paymentContext = contextData as PaymentContextWithAmount;
        loader.hide();
    });

    /**
     * Retrieves IIN (Issuer Identification Number) details for a given card number.
     * @param cardNumber - The full or partial credit card number.
     * @returns A Promise resolving to the IIN details or null if unavailable.
     */
    const getIinDetails = async (cardNumber: string) => {
        try {
            return await session!.getIinDetails(cardNumber.replace(/\s+/g, '').trim(), paymentContext);
        } catch (e) {
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
        if (paymentRequest.getErrorMessageIds()?.length) {
            error = true;
        } else {
            error = false;
            if (key === 'cardNumber' && value.length > 5) {
                getIinDetails(value).then((details) => {
                    if (!details || details.paymentProductId !== paymentProduct.id) {
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
        const maskedValue = paymentRequest.getMaskedValue(key) ?? value;
        paymentModel = { ...paymentModel, [key]: maskedValue };
    };

    $: modelErrors.cardNumber = validateField('cardNumber', paymentModel.cardNumber);
    $: modelErrors.cvv = validateField('cvv', paymentModel.cvv);
    $: modelErrors.cardholderName = validateField('cardholderName', paymentModel.cardholderName);
    $: modelErrors.expiryDate = validateField('expiryDate', paymentModel.expiryDate);

    /**
     * Handles submission of the credit card payment form.
     * Encrypts the payment request and stores it, then navigates to the finalize payment page.
     * @param event - The Submit event of the form.
     */
    const handleProcessPayment = async (event: Event) => {
        event.preventDefault();
        const paymentRequest = PaymentRequestUtility.get(paymentProduct);
        paymentRequest!.setTokenize(isRecurring);

        if (!paymentProduct || !session || !paymentRequest) {
            return;
        }

        (['cardNumber', 'expiryDate', 'cvv', 'cardholderName'] as const).forEach((key) => {
            paymentRequest.setValue(key, paymentModel[key]);
        });

        if (paymentRequest.isValid()) {
            try {
                await EncryptionService.encrypt(session, paymentRequest);
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
        {translations.selected_card_type} {paymentProduct?.json?.displayHints?.label}
    </p>

    <a class="button link self-start" href={resolve('/payment')}>{translations.back_to_payment_method_selection}</a>

    <form class="form" id="creditCardForm" on:submit|preventDefault={handleProcessPayment}>
        <Input
            id="cardNumber"
            type="text"
            label={translations.card_number}
            bind:value={paymentModel.cardNumber}
            on:input={(e) => handleMask('cardNumber', (e.target as HTMLInputElement)?.value)}
            required
            fieldAttrs={{ class: modelErrors.cardNumber ? 'error' : '' }}
        />

        <div class="flex row">
            <Input
                id="expiryDate"
                type="text"
                label={translations.expiry_date}
                bind:value={paymentModel.expiryDate}
                on:input={(e) => handleMask('expiryDate', (e.target as HTMLInputElement)?.value)}
                required
                fieldAttrs={{ class: modelErrors.expiryDate ? 'error' : '' }}
            />

            {#if paymentProduct?.json?.fields.find(f => f.id === 'cvv')}
                <Input
                    id="cvv"
                    type="text"
                    label={translations.security_code}
                    bind:value={paymentModel.cvv}
                    on:input={(e) => handleMask('cvv', (e.target as HTMLInputElement)?.value)}
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
            on:input={(e) => handleMask('cardholderName', (e.target as HTMLInputElement)?.value)}
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
        {session}
        cardNumber={paymentModel.cardNumber}
        cardNumberError={modelErrors.cardNumber}
        amountOfMoney={paymentContext?.amountOfMoney}
    />
</div>
