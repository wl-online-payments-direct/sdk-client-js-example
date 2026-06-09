/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
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
