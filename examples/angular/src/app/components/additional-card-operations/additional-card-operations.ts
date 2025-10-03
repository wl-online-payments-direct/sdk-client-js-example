import { Component, Input, signal } from '@angular/core';
import { AmountOfMoneyJSON, ErrorResponseJSON, Session } from 'onlinepayments-sdk-client-js';
import { LoaderService } from '../../services/loader-service';

type CardOperations = {
  currencyConversions: string[];
  surcharges: string[];
};

type CardOperationsErrorMessages = {
  currencyConversions: string[];
  surcharges: string[];
};

@Component({
  selector: 'additional-card-operations',
  imports: [],
  standalone: true,
  templateUrl: './additional-card-operations.html',
  styleUrls: ['./additional-card-operations.css'],
})
export class AdditionalCardOperations {
  @Input() session: Session | null = null;
  @Input() cardNumber = '';
  @Input() cardNumberError = false;
  @Input() paymentProductId?: number;
  @Input({ required: true }) amountOfMoney!: AmountOfMoneyJSON;

  cardOperations = signal<CardOperations>({
    currencyConversions: [],
    surcharges: [],
  });

  cardOperationsErrors = signal<CardOperationsErrorMessages>({
    currencyConversions: [],
    surcharges: [],
  });

  constructor(private loader: LoaderService) {}

  handleClickCurrencyConversion(): void {
    this.cardOperationsErrors.update((prev) => ({ ...prev, currencyConversions: [] }));

    const trimmedCardNumber = this.cardNumber.replaceAll(' ', '');

    if (!this.cardNumberError && trimmedCardNumber.length > 0) {
      this.processCurrencyConversion(trimmedCardNumber);
    } else {
      this.cardOperationsErrors.update((prev) => ({
        ...prev,
        currencyConversions: [...prev.currencyConversions, 'Please enter the card number.'],
      }));
    }
  }

  private processCurrencyConversion(cardNumber: string): void {
    this.loader.show();

    this.session
      ?.getCurrencyConversionQuote(this.amountOfMoney, {
        partialCreditCardNumber: cardNumber,
        paymentProductId: this.paymentProductId,
      })
      .then((response) => {
        if (response?.result) {
          this.cardOperations.update((prev) => ({
            ...prev,
            currencyConversions: [
              ...prev.currencyConversions,
              `${response.result.result} (${response.result.resultReason})`,
            ],
          }));
        }
        if (response?.proposal?.rate?.exchangeRate) {
          this.cardOperations.update((prev) => ({
            ...prev,
            currencyConversions: [
              ...prev.currencyConversions,
              ` Rate: ${response.proposal.rate.exchangeRate}`,
            ],
          }));
        }
      })
      .catch((response: ErrorResponseJSON) => {
        if (response?.errors?.length) {
          const errors = response.errors.flatMap((e) => (e.message ? [e.message] : []));
          this.cardOperationsErrors.update((prev) => ({
            ...prev,
            currencyConversions: [...prev.currencyConversions, ...errors],
          }));
        }
      })
      .finally(() => {
        this.loader.hide();
      });
  }

  handleClickSurcharge(): void {
    this.cardOperationsErrors.update((prev) => ({ ...prev, surcharges: [] }));

    const trimmedCardNumber = this.cardNumber.replaceAll(' ', '');

    if (!this.cardNumberError && trimmedCardNumber.length > 0) {
      this.processSurcharge(trimmedCardNumber);
    } else {
      this.cardOperationsErrors.update((prev) => ({
        ...prev,
        surcharges: [...prev.surcharges, 'Please enter the card number.'],
      }));
    }
  }

  private processSurcharge(cardNumber: string): void {
    this.loader.show();

    this.session
      ?.getSurchargeCalculation(this.amountOfMoney, {
        partialCreditCardNumber: cardNumber,
        paymentProductId: this.paymentProductId,
      })
      .then((response) => {
        if (Array.isArray(response?.surcharges) && response.surcharges.length) {
          const items: string[] = [];
          response.surcharges.forEach((surcharge: any, index: number) => {
            if (surcharge?.result === 'OK' && surcharge?.surchargeAmount) {
              items.push(
                `Surcharge ${index + 1}: ${surcharge.surchargeAmount.amount} ${surcharge.surchargeAmount.currencyCode}`,
              );
            }
          });

          if (items.length) {
            this.cardOperations.update((prev) => ({
              ...prev,
              surcharges: [...prev.surcharges, ...items],
            }));
          }
        }
      })
      .catch((response: ErrorResponseJSON) => {
        if (response?.errors?.length) {
          const errors = response.errors.flatMap((e) => (e.message ? [e.message] : []));
          this.cardOperationsErrors.update((prev) => ({
            ...prev,
            surcharges: [...prev.surcharges, ...errors],
          }));
        }
      })
      .finally(() => {
        this.loader.hide();
      });
  }
}
