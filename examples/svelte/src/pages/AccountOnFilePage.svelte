<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        type AccountOnFile,
        init,
        type OnlinePaymentSdk,
        type PaymentContextWithAmount
    } from 'onlinepayments-sdk-client-js';
    import { PaymentProduct } from 'onlinepayments-sdk-client-js';
    import Input from '../components/FormFields/Input/Input.svelte';
    import Logo from '../components/Logo/Logo.svelte';
    import StorageService from '@shared/services/StorageService';
    import NumberFormatter from '@shared/utilities/NumberFormatter';
    import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
    import { translations } from '../translations/translations';
    import { loader } from '../stores/loader';
    import { resolve } from '$app/paths';
    import PaymentProductService from '@shared/services/PaymentProductService';
    import Loader from '../components/Loader/Loader.svelte';

    let sdk: OnlinePaymentSdk | null = null;
    let paymentContext: PaymentContextWithAmount | null;
    let paymentProduct: PaymentProduct | null;
    let accountOnFile: AccountOnFile | undefined;
    let cvv: string = '';
    let error: boolean = false;
    let isLoading: boolean = true;

    const initData = async () => {
        loader.show();
        const sessionData = StorageService.getSessionData();
        paymentContext = (StorageService.getPaymentContext() as PaymentContextWithAmount) ?? null;

        if (!sessionData) {
            goto(resolve('/'));

            return;
        }

        sdk = init(sessionData)

        const productId = StorageService.getPaymentProductId();
        const accountOnFileId = StorageService.getAccountOnFileId();

        if (!productId || !accountOnFileId || !paymentContext) {
            goto(resolve('/payment'));

            return;
        }

        if (productId) {
            paymentProduct = await PaymentProductService.getPaymentProduct(
                sdk,
                productId,
                paymentContext
            );

            if (paymentProduct) {
                isLoading = false;
                accountOnFile = paymentProduct?.accountsOnFile.find(aof => aof.id === accountOnFileId);

                loader.hide();
                return;
            }
        }

        loader.hide();
    }

    onMount((): void => {
        initData().catch(error => console.error(error))
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

        const field = request.getField('cvv')!;
        field.setValue(value);
        const masked: string | undefined = field.getMaskedValue();

        error = !field.validate().isValid;
        cvv = masked ?? value;
    };

    const onCvvChange =  (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        handleChangeCvv(value);
    }


    /**
     * Retrieves the masked expiry date value from the stored account on file.
     *
     * @returns The masked expiry date if available, otherwise the raw value or empty string
     */
    const getExpiryDateMaskedValue = (): string => {
        const request = PaymentRequestUtility.get(
            paymentProduct,
            'expiryDate',
            accountOnFile?.getValue('expiryDate')
        );

        return (
            request?.getField('expiryDate').getMaskedValue() ??
            accountOnFile?.getValue('expiryDate') ??
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

        if(accountOnFile){
            request.setAccountOnFile(accountOnFile)
        }

        if (cvv && paymentProduct?.id) {
            request.setValue('cvv', cvv);
        }

        if (request?.validate().isValid && accountOnFile?.id && cvv && paymentProduct?.id) {
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

    <button class="button link self-start" on:click={navigateToPayment}>
        {translations.back_to_payment_method_selection}
    </button>

    <form class="form form-max-height {isLoading ? 'invisible' : ''}" on:submit|preventDefault={handleSubmit}>
        <Input
            id="cardNumber"
            type="text"
            label={translations.card_number}
            value={accountOnFile?.label}
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

            {#if paymentProduct?.fields.find((field) => field.id === 'cvv')}
                <Input
                    id="cvv"
                    type="text"
                    label={translations.security_code}
                    bind:value={cvv}
                    required
                    on:input={(e) => onCvvChange(e)}
                    fieldAttrs={{ step: '1', class: error ? 'error' : '' }}
                />
            {/if}
        </div>

        <Input
            id="cardholderName"
            type="text"
            label={translations.cardholder_name}
            value={accountOnFile?.getValue('cardholderName') ?? ''}
            disabled
            required
        />

        <button class="button primary" type="submit">
            {translations.pay_now}
        </button>
    </form>
</div>
