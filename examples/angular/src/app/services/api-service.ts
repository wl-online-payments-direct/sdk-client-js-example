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
import { ErrorResponse, SessionData } from 'onlinepayments-sdk-client-js';
import { mockApiUrl } from '../../config';
import { Injectable } from '@angular/core';
import type { CreatePaymentRequest } from '@shared/types/CreatePaymentRequest';

@Injectable({ providedIn: 'root' })
export class ApiService {
  headers = {
    'Content-Type': 'application/json',
  };

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw (await response.json()) as ErrorResponse;
    }

    return (await response.json()) as T;
  }

  async createPayment(data: CreatePaymentRequest) {
    const response = await fetch(mockApiUrl + '/payment', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<unknown>(response);
  }

  async getSession() {
    const response = await fetch(mockApiUrl + '/session', {
      method: 'GET',
      headers: this.headers,
    });
    return this.handleResponse<SessionData>(response);
  }
}
