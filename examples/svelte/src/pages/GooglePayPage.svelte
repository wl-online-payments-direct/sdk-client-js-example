<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import StorageService from '@shared/services/StorageService';
    import NumberFormatter from '@shared/utilities/NumberFormatter';
    import EncryptionService from '@shared/services/EncryptionService';
    import {
        type PaymentContextWithAmount,
        PaymentProduct,
        PaymentRequest,
        OnlinePaymentSdk, init
    } from 'onlinepayments-sdk-client-js';
    import { translations } from '../translations/translations';
    import Logo from '../components/Logo/Logo.svelte';
    import { loader } from '../stores/loader';
    import { resolve } from '$app/paths';
    import PaymentProductService from '@shared/services/PaymentProductService';
    import Loader from '../components/Loader/Loader.svelte';

    let paymentContext: PaymentContextWithAmount | null = null;
    let paymentProduct: PaymentProduct | null = null;
    let sdk: OnlinePaymentSdk;
    let isRecurring = false;
    let errorMessage = '';
    let paymentsClient: GooglePaymentsClient;
    let baseRequest: PaymentDataRequest;
    let isLoading = true;

    /**
     * Creates a base PaymentDataRequest object for Google Pay.
     *
     * @param {string[]} allowedNetworks - Allowed card networks (e.g., VISA, MASTERCARD).
     * @returns {PaymentDataRequest} The base PaymentDataRequest object.
     */
    const createBaseRequest = (allowedNetworks: string[]): PaymentDataRequest => ({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: allowedNetworks
                }
            }
        ]
    });

    /**
     * Encrypts Google Pay token and stores it in StorageService.
     * Navigates to the "finalize" payment page if successful.
     *
     * @param {string} [token] - The token received from Google Pay.
     */
    const handleEncryptGooglePayData = (token?: string): void => {
        if (!token || !paymentProduct || !sdk) {
            return;
        }

        const pr = new PaymentRequest(paymentProduct);
        pr.setTokenize(isRecurring);
        pr.setValue('encryptedPaymentData', token);

        if (pr.validate().isValid) {
            EncryptionService.encrypt(sdk, pr)
                .then(() => {
                    StorageService.setPaymentRequest(pr);

                    goto(resolve('/payment/finalize/'));
                })
                .catch((errors) => {
                    errorMessage = 'Errors: ' + JSON.stringify(errors);
                });
        }
    };


    /**
     * Returns the Google Pay card payment method configuration for the current payment product.
     *
     * @returns {any} Card payment method object for PaymentDataRequest.
     */
    const getCardPaymentMethod = () => {
        return ({
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks:
                    paymentProduct?.paymentProduct320SpecificData?.networks ?? ['VISA', 'MASTERCARD']
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: paymentProduct?.paymentProduct320SpecificData?.gateway?.trim().toLowerCase() ?? 'gateway',
                    gatewayMerchantId: 'DemoMerchant'
                }
            }
        });
    };

    /**
     * Builds a full PaymentDataRequest object for Google Pay with transaction info.
     *
     * @returns {PaymentDataRequest} The full PaymentDataRequest object.
     */
    const getPaymentDataRequest = (): PaymentDataRequest => ({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [getCardPaymentMethod()],
        merchantInfo: { merchantName: 'Demo Merchant' },
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: NumberFormatter.formatAmountForGooglePay(
                paymentContext!.amountOfMoney.currencyCode ?? 'EUR',
                paymentContext!.amountOfMoney.amount ?? 1000
            ),
            currencyCode: paymentContext!.amountOfMoney.currencyCode,
            countryCode: paymentContext!.countryCode
        }
    });

    /**
     * Handler for Google Pay button click.
     * Loads the Google Pay sheet and encrypts the token on success.
     */
    const onGooglePayButtonClicked = (): void => {
        if (!paymentContext || !paymentProduct) {
            return;
        }

        paymentsClient
            .loadPaymentData(getPaymentDataRequest())
            .then((paymentData) => {
                const token = paymentData?.paymentMethodData?.tokenizationData?.token;
                handleEncryptGooglePayData(token);
            })
            .catch((err) => {
                console.error(err);
                errorMessage = err?.message ?? 'Error loading Google Pay sheet';
            });
    };

    const initData = async () => {
        loader.show();
        const s = StorageService.getSessionData();

        if (!s) {
            goto(resolve('/'));

            return;
        }

        const productId = StorageService.getPaymentProductId();
        const context = StorageService.getPaymentContext()

        if (!productId || !context) {
            goto(resolve('/payment/'));

            return;
        }

        paymentContext = StorageService.getPaymentContext();

        sdk = init(s)

        paymentProduct = await PaymentProductService.getPaymentProduct(sdk, productId, context)

        if(!paymentProduct){
            goto(resolve('/payment'));

            return;
        }

        baseRequest = createBaseRequest(
            paymentProduct?.paymentProduct320SpecificData?.networks ?? ['VISA', 'MASTERCARD']
        );

        paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

        paymentsClient
            .isReadyToPay(baseRequest)
            .then((res) => {
                if (res.result) {
                    const container = document.getElementById('googlePay');
                    if (container) {
                        const button = paymentsClient.createButton({ onClick: onGooglePayButtonClicked });
                        container.appendChild(button);
                    }
                } else {
                    errorMessage = 'Google Pay not available';
                }
            })
            .catch((err) => {
                console.error(err);
                errorMessage = 'Error loading Google Pay Integration';
            });

        loader.hide();
        isLoading = false;
    }

    onMount(() => {
        initData().catch(error => console.error(error))
    });
</script>

<Loader />

<div class="page flex column center">
    <Logo />
    <h1 class="m-0">{translations.pay_with_google_pay}</h1>
    <p class="self-start m-0">
        <strong>
            {translations.total_amount}
            {#if paymentContext}
                {NumberFormatter.formatAmount(paymentContext.amountOfMoney.currencyCode, paymentContext.amountOfMoney.amount)}
                {paymentContext.amountOfMoney.currencyCode}
            {/if}
        </strong>
    </p>

    <a class="button link self-start" href={resolve('/payment')}>
        {translations.back_to_payment_method_selection}
    </a>

    <div id="googlePay" class="form form-max-height flex column center m-0 {isLoading ? 'invisible' : ''}"></div>

    <div class="error">{errorMessage}</div>
</div>
