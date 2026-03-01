import type { PaymentContextWithAmount, SessionData } from 'onlinepayments-sdk-client-js';
import { init } from 'onlinepayments-sdk-client-js';
import { createPayload } from './create-payload';

const root = document.querySelector<HTMLDivElement>('#app')!;

const sessionData: SessionData = {
    assetUrl: import.meta.env.VITE_ASSET_URL,
    clientApiUrl: import.meta.env.VITE_CLIENT_API_URL,
    clientSessionId: import.meta.env.VITE_CLIENT_SESSION_ID,
    customerId: import.meta.env.VITE_CUSTOMER_ID
};

if (Object.values(sessionData).some((v) => !v)) {
    root.innerHTML = `Provide correct environment variables, see README.md`;
    throw new Error(`Missing session details environment variables`);
}

const paymentContext: PaymentContextWithAmount = {
    countryCode: 'NL',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
    isRecurring: false
};

try {
    root.innerHTML = `Processing...`;

    const paymentHash = await createPayload(init(sessionData), '4450 2132 7399 3630', paymentContext);

    root.innerHTML = `Encrypted to: ${paymentHash}`;
} catch (err) {
    if (err instanceof Error) {
        root.innerHTML = err.message;
    }
}
