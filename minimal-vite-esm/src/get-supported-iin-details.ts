import type { CreatePayloadProps } from "./types";

import { IinDetailsStatus } from "onlinepayments-sdk-client-js";

const errorMessage = new Map<IinDetailsStatus, string>([
  ["UNKNOWN", "Unknown error"],
  ["NOT_ENOUGH_DIGITS", "Card number does not contains enough digits"],
]);

async function getIinDetails({
  session,
  paymentContext,
  cardNumber,
}: CreatePayloadProps) {
  const iinDetailsResponse = await session.getIinDetails(
    cardNumber,
    paymentContext,
  );

  if (iinDetailsResponse.status !== "SUPPORTED") {
    throw new Error(`Failed getting IinDetails, check your credentials`);
  }

  if (typeof iinDetailsResponse.paymentProductId === "undefined") {
    throw new Error(
      `Failed getting IinDetails, paymentProductId is not defined`,
    );
  }

  return iinDetailsResponse;
}

function isIinDetailsResponse(
  err: unknown,
): err is Record<string, unknown> & { status: IinDetailsStatus } {
  return !!(err && typeof err === "object" && "status" in err);
}

/**
 * Get IIN details where status is SUPPORTED
 * And throw correct error messages if promise is rejected
 */
export async function getSupportedIinDetails(props: CreatePayloadProps) {
  try {
    return await getIinDetails(props);
  } catch (err) {
    throw new Error(
      isIinDetailsResponse(err)
        ? `Card check error: ${errorMessage.get(err.status)}`
        : `Failed getting IinDetails, check your credentials`,
    );
  }
}
