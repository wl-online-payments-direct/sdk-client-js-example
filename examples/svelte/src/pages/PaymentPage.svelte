<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Logo from '../components/Logo/Logo.svelte';
    import PaymentDetails from '../components/PaymentDetails/PaymentDetails.svelte';
    import ProductSelection from '../components/ProductSelection/ProductSelection.svelte';
    import AccountsOnFileSelection from '../components/AccountOnFile/AccountsOnFileSelection.svelte';
    import { translations } from '../translations/translations';
    import StorageService from '@shared/services/StorageService';
    import { loader } from '../stores/loader';
    import {
        BasicPaymentItems,
        type PaymentContext,
        type PaymentContextWithAmount,
        PaymentProduct,
        Session
    } from 'onlinepayments-sdk-client-js';
    import Loader from '../components/Loader/Loader.svelte';
    import { resolve } from '$app/paths';
    import type DeepPartial from '@shared/types/DeepPartial';

    type PaymentContextPartial = DeepPartial<PaymentContextWithAmount>;

    const PaymentContextInitialState: PaymentContextPartial = {
        amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
        countryCode: 'BE',
        isRecurring: false
    };

    type ErrorType = { message?: string; status?: number };

    let session: Session | null = null;
    let paymentContext: PaymentContextPartial = { ...PaymentContextInitialState };
    let isFormExpanded = true;
    let errorMessage = '';
    let paymentMethods: BasicPaymentItems | undefined;


    onMount(() => {
        const sessionDetails = StorageService.getSession();
        paymentContext = StorageService.getPaymentContext() ?? { ...PaymentContextInitialState };
        StorageService.clearItem('accountOnFileId');

        if (!sessionDetails) {
            goto(resolve('/'));
        } else {
            session = new Session(sessionDetails);
        }
    });

    /**
     * Fetches available payment products based on the current payment context.
     * Updates errorMessage if an error occurs.
     *
     * @param {PaymentContext} context - The payment context to fetch products for.
     * @returns {Promise<void>}
     */
    const fetchPaymentProducts = async (context: PaymentContext): Promise<void> => {
        loader.show();
        try {
            if (!session) {
                return;
            }

            paymentMethods = await session.getBasicPaymentItems(context);
            errorMessage = '';
        } catch (err: unknown) {
            const error = err as ErrorType;
            errorMessage = error?.message ?? '';
            handleUnauthorizedError(error);
            paymentMethods = undefined;
        } finally {
            loader.hide();
        }
    };

    /**
     * Toggles the expansion state of the payment form.
     */
    const handleExpandCollapse = (): void => {
        isFormExpanded = !isFormExpanded;
    };

    /**
     * Saves the provided payment context to storage and fetches available payment products.
     *
     * @param {PaymentContextWithAmount} context - The payment context to store.
     */
    const handleSaveContextToStorage = (context: PaymentContextWithAmount): void => {
        StorageService.setPaymentContext(context);
        fetchPaymentProducts(context);
    };

    /**
     * Handles unauthorized errors by clearing storage and navigating to the home page.
     *
     * @param {ErrorType} error - The error object.
     */
    const handleUnauthorizedError = (error: ErrorType): void => {
        if (error?.status === 403) {
            StorageService.clear();

            goto(resolve('/'));
        }
    };

    /**
     * Sets the selected payment product and stores it in StorageService.
     *
     * @param {number} productId - The ID of the selected payment product.
     * @returns {Promise<PaymentProduct | undefined>} - The selected PaymentProduct or undefined if not found.
     */
    const setSelectedProduct = async (productId: number): Promise<PaymentProduct | undefined> => {
        loader.show();
        const paymentProduct = await session?.getPaymentProduct(productId, paymentContext as PaymentContext);

        if (!paymentProduct) {
            errorMessage = translations.payment_product_not_found;
            loader.hide();

            return;
        }

        StorageService.setPaymentProduct(paymentProduct.json);
        loader.hide();

        return paymentProduct;
    };

    /**
     * Handles selection of a payment product by the user.
     * Navigates to the corresponding payment page if supported.
     *
     * @param {string} id - The selected product ID.
     * @returns {Promise<void>}
     */
    const handleProductSelection = async (id: string): Promise<void> => {
        const product = await setSelectedProduct(Number(id));

        if (product?.paymentMethod === 'card') {
            await goto(resolve('/payment/credit-card'));
        } else if (product?.paymentMethod === 'mobile' && product?.displayHints?.label === 'GOOGLEPAY') {
            await goto(resolve('/payment/google-pay'));
        } else {
            errorMessage = translations.this_demo_supports_only_card_payment_and_google_pay;
        }
    };

    /**
     * Handles selection of an account-on-file by the user.
     * Sets the product and navigates to the account-on-file payment page if supported.
     *
     * @param {string} id - The selected account-on-file ID.
     * @returns {Promise<void>}
     */
    const handleAccountOnFileSelection = async (id: string): Promise<void> => {
        const aof = paymentMethods?.accountOnFileById[id];
        if (!aof) {
            return;
        }

        const product = await setSelectedProduct(aof.paymentProductId);
        StorageService.setAccountOnFileId(id);

        if (product?.paymentMethod === 'card') {
            await goto(resolve('/payment/account-on-file'));
        } else {
            errorMessage = translations.this_demo_supports_only_card_payment_and_google_pay;
        }
    };
</script>

<Loader />

<div class="page">
    <Logo />
    <h1>{translations.payment_details}</h1>

    <PaymentDetails
        {paymentContext}
        {isFormExpanded}
        onExpandCollapse={handleExpandCollapse}
        onSaveContextToStorage={handleSaveContextToStorage}
    />

    <div class="flex row">
        {#if paymentMethods?.basicPaymentItems?.length}
            <ProductSelection
                items={paymentMethods.basicPaymentItems}
                onSelectedProduct={handleProductSelection}
            />
        {/if}

        {#if paymentMethods?.accountOnFileById && Object.keys(paymentMethods.accountOnFileById).length > 0}
            <div class="flex-expand">
                <AccountsOnFileSelection
                    accountsOnFile={Object.values(paymentMethods.accountOnFileById)}
                    onSelectedProduct={handleAccountOnFileSelection}
                />
            </div>
        {/if}
    </div>

    {#if errorMessage}
        <div class="error">{errorMessage}</div>
    {/if}
</div>
