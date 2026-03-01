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
