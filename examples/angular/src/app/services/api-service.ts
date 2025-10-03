import { ErrorResponseJSON, SessionDetails } from 'onlinepayments-sdk-client-js';
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
      throw (await response.json()) as ErrorResponseJSON;
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
    return this.handleResponse<SessionDetails>(response);
  }
}
