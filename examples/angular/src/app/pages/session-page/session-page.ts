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
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorResponse, SessionData } from 'onlinepayments-sdk-client-js';
import { FormInput } from '../../components/form-elements/input/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';
import { LogoComponent } from '../../components/logo/logo';
import StorageService from '@shared/services/StorageService';
import { useMockApi } from '../../../config';
import { LoaderService } from '../../services/loader-service';

type SessionDetailsForm = {
  assetUrl: FormControl<string>;
  customerId: FormControl<string>;
  clientApiUrl: FormControl<string>;
  clientSessionId: FormControl<string>;
};

@Component({
  selector: 'session-page',
  imports: [FormInput, ReactiveFormsModule, LogoComponent],
  templateUrl: './session-page.html',
  standalone: true,
})
export class SessionPage {
  apiService: ApiService = inject(ApiService);
  router = inject(Router);

  @ViewChild('sessionFormRef', { read: ElementRef })
  sessionFormRef!: ElementRef<HTMLFormElement>;

  sessionDetails = new FormGroup<SessionDetailsForm>({
    assetUrl: new FormControl<string>('', { nonNullable: true }),
    customerId: new FormControl<string>('', { nonNullable: true }),
    clientApiUrl: new FormControl<string>('', { nonNullable: true }),
    clientSessionId: new FormControl<string>('', { nonNullable: true }),
  });

  errorMessage = signal<string>('');

  constructor(private loader: LoaderService) {}

  ngOnInit() {
    const sessionDetails = StorageService.getSessionData();
    if (sessionDetails) {
      this.sessionDetails.patchValue(sessionDetails, {
        emitEvent: false,
      });
    }
  }

  handleSubmit() {
    this.sessionFormRef.nativeElement.reportValidity();
    if (this.sessionDetails.valid) {
      const newSessionDetails: SessionData = { ...this.sessionDetails.getRawValue() };

      StorageService.clear();
      StorageService.setSession(newSessionDetails);

      void this.router.navigate(['/payment']);
    }
  }

  pasteData() {
    navigator.clipboard.readText().then((text) => {
      try {
        const data = JSON.parse(text);
        if (data?.assetUrl && data.clientApiUrl && data.clientSessionId && data.customerId) {
          const newValue = {
            clientSessionId: data.clientSessionId,
            clientApiUrl: data.clientApiUrl,
            assetUrl: data.assetUrl,
            customerId: data.customerId,
          };
          this.sessionDetails.setValue(newValue, { emitEvent: false });
          return;
        }
      } catch (_) {
        this.errorMessage.set('The clipboard does not contain valid data.');
      }
    });
  }

  async fetchSessionFromAPI() {
    this.loader.show();
    this.apiService
      .getSession()
      .then((response) => {
        const sessionDetails: SessionData = {
          clientSessionId: response.clientSessionId,
          clientApiUrl: response.clientApiUrl,
          assetUrl: response.assetUrl,
          customerId: response.customerId,
        };

        this.sessionDetails.setValue(sessionDetails, { emitEvent: false });
      })
      .catch((error: ErrorResponse) => {
        if (error.errors?.length) {
          this.errorMessage.set(
            'Errors while fetching data: ' + error.errors.map((err) => err.message).join(', '),
          );
        } else {
          this.errorMessage.set('There was an error fetching data. Did you start the mock API?');
        }
      })
      .finally(() => {
        this.loader.hide();
      });
  }

  protected readonly useMockApi = useMockApi;
}
