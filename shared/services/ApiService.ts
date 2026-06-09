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
import type { ErrorResponse, SessionData } from 'onlinepayments-sdk-client-js';
import type { CreatePaymentRequest } from '../types/CreatePaymentRequest.ts';

const ApiService = (mockApiUrl: string) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const handleResponse = async <T>(response: Response): Promise<T> => {
        if (!response.ok) {
            throw (await response.json()) as ErrorResponse;
        }

        return (await response.json()) as T;
    };

    const createPayment = async (data: CreatePaymentRequest) => {
        const response = await fetch(mockApiUrl + '/payment', {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        return handleResponse<unknown>(response);
    };

    const createToken = async (merchantId: string, encryptedData: string) => {
        const response = await fetch(mockApiUrl + '/tokens/' + merchantId, {
            method: 'POST',
            headers,
            body: JSON.stringify({ encryptedData })
        });

        return handleResponse<unknown>(response);
    };

    const getSession = async () => {
        const response = await fetch(mockApiUrl + '/session', {
            method: 'GET',
            headers
        });
        return handleResponse<SessionData>(response);
    };

    return {
        getSession,
        createPayment,
        createToken
    };
};

export default ApiService;
