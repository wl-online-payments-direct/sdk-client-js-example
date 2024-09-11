import type { PaymentContext, Session } from "onlinepayments-sdk-client-js";

export type CreatePayloadProps = {
  session: Session;
  cardNumber: string;
  paymentContext: PaymentContext;
};
