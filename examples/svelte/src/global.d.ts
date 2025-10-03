interface GooglePaymentsClient {
    isReadyToPay(request: PaymentDataRequest): Promise<{ result: boolean }>;
    createButton(options: { onClick: () => void; buttonColor?: string; buttonType?: string }): HTMLElement;
    loadPaymentData(request: PaymentDataRequest): Promise<PaymentDataResponse>;
}

interface PaymentDataRequest {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: any[];
    merchantInfo?: { merchantName: string; merchantId?: string };
    transactionInfo?: {
        totalPriceStatus: string;
        totalPrice: string;
        currencyCode: string;
        countryCode?: string;
    };
}

interface PaymentDataResponse {
    paymentMethodData?: {
        tokenizationData?: { token?: string };
    };
}

interface GooglePaymentsApi {
    PaymentsClient: new (options: { environment: string }) => GooglePaymentsClient;
}

interface Window {
    google?: { payments?: { api?: GooglePaymentsApi } };
}

declare const google: { payments: { api: GooglePaymentsApi } };
