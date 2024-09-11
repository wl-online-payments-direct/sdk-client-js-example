import type {
  PaymentContext,
  SessionDetails,
} from "onlinepayments-sdk-client-js";

import { Session } from "onlinepayments-sdk-client-js";
import { createPayload } from "./create-payload";

const root = document.querySelector<HTMLDivElement>("#app")!;

const sessionDetails: SessionDetails = {
  assetUrl: import.meta.env.VITE_ASSET_URL,
  clientApiUrl: import.meta.env.VITE_CLIENT_API_URL,
  clientSessionId: import.meta.env.VITE_CLIENT_SESSION_ID,
  customerId: import.meta.env.VITE_CUSTOMER_ID,
};

if (Object.values(sessionDetails).some((v) => !v)) {
  root.innerHTML = `Provide correct environment variables, see README.md`;
  throw new Error(`Missing session details environment variables`);
}

const paymentContext: PaymentContext = {
  countryCode: "NL",
  amountOfMoney: { amount: 1000, currencyCode: "EUR" },
  locale: "nl_NL",
  isRecurring: false,
};

try {
  root.innerHTML = `Processing...`;

  const paymentHash = await createPayload({
    session: new Session(sessionDetails),
    paymentContext,
    cardNumber: "4567 3500 0042 7977",
  });

  root.innerHTML = `Encrypted to: ${paymentHash}`;
} catch (err) {
  console.error(err);
  if (err instanceof Error) {
    root.innerHTML = err.message;
  }
}
