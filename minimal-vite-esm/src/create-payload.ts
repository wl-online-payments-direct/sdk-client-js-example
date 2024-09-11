import type { CreatePayloadProps } from "./types";

import { PaymentRequest } from "onlinepayments-sdk-client-js";
import { promiseWithError } from "./promise-with-error";
import { getSupportedIinDetails } from "./get-supported-iin-details";

export async function createPayload(props: CreatePayloadProps) {
  const { session, cardNumber, paymentContext } = props;

  // get payment product from IIN details
  const { paymentProductId } = await getSupportedIinDetails(props);
  if (typeof paymentProductId === "undefined") {
    throw new Error(
      `Failed getting IinDetails, paymentProductId is not defined`,
    );
  }

  // get payment product
  const paymentProduct = await session.getPaymentProduct(
    paymentProductId,
    paymentContext,
  );

  // update session payment request instance
  const paymentRequest = new PaymentRequest();
  paymentRequest.setPaymentProduct(paymentProduct);
  paymentRequest.setValue("cardNumber", cardNumber);
  paymentRequest.setValue("cvv", "123");
  paymentRequest.setValue("cardholderName", "John Doe");
  paymentRequest.setValue(
    "expiryDate",
    Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      year: "2-digit",
    }).format(new Date()),
  );

  // validate payment request
  if (!paymentRequest.isValid()) {
    throw new Error(`Errors found in ${paymentRequest.getErrorMessageIds()}`);
  }

  // encrypt the payment request
  const encryptor = session.getEncryptor();
  return promiseWithError(
    () => encryptor.encrypt(paymentRequest),
    "Failed encrypting the payload, check your credentials",
  );
}
