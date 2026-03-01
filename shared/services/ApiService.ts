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
