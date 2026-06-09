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
import { MockApiUrl } from '../config.js';

/**
 * API Service. Used to call mock API.
 *
 * @returns {{getSession: (function(): Promise<any>), createPayment: (function(Object): Promise<any>)}}
 * @constructor
 */
const ApiService = () => {
    const headers = {
        'Content-Type': 'application/json'
    };

    /**
     * Handles the API response. If the request was not successful, throws the response as an error.
     *
     * @param {Response} response
     * @returns {Promise<any>}
     */
    const handleResponse = (response) => {
        if (!response.ok) {
            return new Promise((resolve, reject) => {
                response.json().then(reject);
            });
        }

        return response.json();
    };

    /**
     * Gets new session details.
     *
     * @returns {Promise<any>}
     */
    const getSession = () => {
        return fetch(`${MockApiUrl}/session`, {
            method: 'GET',
            headers
        }).then(handleResponse);
    };

    /**
     * Sends encrypted data to create a payment and returns the payment result.
     *
     * @param {object} data
     * @returns {Promise<any>}
     */
    const createPayment = (data) => {
        return fetch(`${MockApiUrl}/payment`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        }).then(handleResponse);
    };

    return {
        getSession,
        createPayment
    };
};

export default ApiService();
