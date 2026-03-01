// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';

const ErrorService = () => {
    /**
     *  Method that handles SdkError with metadata (ErrorResponse).
     *
     * @param {sdk.SdkError} error
     * @returns {string[] | []}
     */
    const extractErrorMessages = (error) => {
        if (error.metadata && 'errors' in error.metadata) {
            const metadata = error.metadata;

            if (metadata.errors?.length) {
                return metadata.errors.map((error) => error.message).filter((message) => !!message);
            }
        }
        return [];
    };

    return { extractErrorMessages };
};

export default ErrorService();
