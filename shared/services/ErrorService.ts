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
import type { ApiError, ErrorResponse, SdkError } from 'onlinepayments-sdk-client-js';

const ErrorService = () => {
    const extractErrorMessages = (error: SdkError): string[] => {
        if (error.metadata && 'errors' in error.metadata) {
            const metadata = error.metadata as ErrorResponse;

            if (metadata.errors?.length) {
                return metadata.errors
                    .map((error: ApiError) => error.message)
                    .filter((message): message is string => !!message);
            }
        }
        return [];
    };

    return { extractErrorMessages };
};

export default ErrorService();
