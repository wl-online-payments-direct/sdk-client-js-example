import type { ErrorResponseJSON, SessionDetails } from 'onlinepayments-sdk-client-js';
import type { CreatePaymentRequest } from '../types/CreatePaymentRequest.ts';

const ApiService = (mockApiUrl: string) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const handleResponse = async <T>(response: Response): Promise<T> => {
        if (!response.ok) {
            throw (await response.json()) as ErrorResponseJSON;
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

    const getSession = async () => {
        const response = await fetch(mockApiUrl + '/session', {
            method: 'GET',
            headers
        });
        return handleResponse<SessionDetails>(response);
    };

    return {
        getSession,
        createPayment
    };
};

export default ApiService;
