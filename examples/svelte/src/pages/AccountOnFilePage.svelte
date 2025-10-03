<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { AccountOnFile, PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
    import { PaymentProduct } from 'onlinepayments-sdk-client-js';
    import Input from '../components/FormFields/Input/Input.svelte';
    import Logo from '../components/Logo/Logo.svelte';
    import StorageService from '@shared/services/StorageService';
    import NumberFormatter from '@shared/utilities/NumberFormatter';
    import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
    import { translations } from '../translations/translations';
    import { loader } from '../stores/loader';
    import { resolve } from '$app/paths';

    let paymentContext: PaymentContextWithAmount | undefined;
    let paymentProduct: PaymentProduct | undefined;
    let accountOnFile: AccountOnFile | undefined;
    let cvv: string = '';
    let error: boolean = false;

    onMount((): void => {
        loader.show();
        const session = StorageService.getSession();
        if (!session) {
            goto(resolve('/'));

            return;
        }

        const storedPaymentProduct = StorageService.getPaymentProduct();
        const accountOnFileId = StorageService.getAccountOnFileId();
        paymentContext = (StorageService.getPaymentContext() as PaymentContextWithAmount) ?? undefined;

        if (!storedPaymentProduct || !accountOnFileId) {
            goto(resolve('/payment'));

            return;
        }

        paymentProduct = new PaymentProduct(storedPaymentProduct);
        accountOnFile = paymentProduct.accountOnFileById?.[accountOnFileId];
        loader.hide();
    });

    /**
     * Handles CVV input changes, validates, masks, and updates the state.
     *
     * @param value - The raw CVV value entered by the user
     */
    const handleChangeCvv = (value: string): void => {
        const request = PaymentRequestUtility.get(paymentProduct, 'cvv', value);
        if (!request) {
            return;
        }

        request.setValue('cvv', value);
        const masked: string | undefined = request.getMaskedValue('cvv');

        error = !!request.getErrorMessageIds()?.length;
        cvv = masked ?? value;
    };

    /**
     * Retrieves the masked expiry date value from the stored account on file.
     *
     * @returns The masked expiry date if available, otherwise the raw value or empty string
     */
    const getExpiryDateMaskedValue = (): string => {
        const request = PaymentRequestUtility.get(
            paymentProduct,
            'expiryDate',
            accountOnFile?.attributeByKey?.['expiryDate']?.value
        );

        return (
            request?.getMaskedValue('expiryDate') ??
            accountOnFile?.attributeByKey?.['expiryDate']?.value ??
            ''
        );
    };

    /**
     * Handles the credit card form submission.
     *
     * @param event - The form submit event
     */
    const handleSubmit = (event: Event): void => {
        event.preventDefault();

        const request = PaymentRequestUtility.get(paymentProduct)!;
        accountOnFile && request.setAccountOnFile(accountOnFile);
        if (cvv && paymentProduct?.id) {
            request.setValue('cvv', cvv);
        }

        if (request?.isValid() && accountOnFile?.id && cvv && paymentProduct?.id) {
            StorageService.setPaymentRequest(request);

            StorageService.setCardPaymentSpecificData({
                token: accountOnFile.id,
                cvv,
                paymentProductId: paymentProduct.id
            });

            goto(resolve('/payment/finalize'));
        }
    };

    /**
     * Navigates the user back to the payment selection page.
     */
    const navigateToPayment = (): void => {
        void goto(resolve('/payment'));
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

    <button class="button link self-start" on:click={navigateToPayment}>
        {translations.back_to_payment_method_selection}
    </button>

    <form class="form" id="creditCardForm" on:submit|preventDefault={handleSubmit}>
        <Input
            id="cardNumber"
            type="text"
            label={translations.card_number}
            value={accountOnFile?.getLabel()?.formattedValue ?? ''}
            disabled
            required
        />

        <div class="flex row">
            <Input
                id="expiryDate"
                type="text"
                label={translations.expiry_date}
                value={accountOnFile ? getExpiryDateMaskedValue() : ''}
                disabled
                required
            />

            {#if paymentProduct?.json?.fields.find((field) => field.id === 'cvv')}
                <Input
                    id="cvv"
                    type="text"
                    label={translations.security_code}
                    bind:value={cvv}
                    required
                    on:input={(e) => handleChangeCvv((e.target as HTMLInputElement)?.value)}
                    fieldAttrs={{ step: '1', class: error ? 'error' : '' }}
                />
            {/if}
        </div>

        <Input
            id="cardholderName"
            type="text"
            label={translations.cardholder_name}
            value={accountOnFile?.attributeByKey['cardholderName']?.value ?? ''}
            disabled
            required
        />

        <button class="button primary" type="submit">
            {translations.pay_now}
        </button>
    </form>
</div>
