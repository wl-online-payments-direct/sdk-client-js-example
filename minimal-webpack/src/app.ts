import type {
  PaymentContext,
  SessionDetails,
} from "onlinepayments-sdk-client-js";

import { Session } from "onlinepayments-sdk-client-js";
import { createPayload } from "./create-payload";

const root = document.querySelector<HTMLDivElement>("#app")!;

const sessionDetails: SessionDetails = {
  assetUrl: process.env.ASSET_URL,
  clientApiUrl: process.env.CLIENT_API_URL,
  clientSessionId: process.env.CLIENT_SESSION_ID,
  customerId: process.env.CUSTOMER_ID,
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
  if (err instanceof Error) {
    root.innerHTML = err.message;
  }
}

// enable hot module replacement
if (module.hot && process.env.NODE_ENV === "development") {
  module.hot.accept();
}
