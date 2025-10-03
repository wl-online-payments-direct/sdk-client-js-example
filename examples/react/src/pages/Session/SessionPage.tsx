import { type FormEvent, useEffect, useState } from 'react';
import type { ErrorResponseJSON, SessionDetails } from 'onlinepayments-sdk-client-js';
import { useNavigate } from 'react-router-dom';
import { mockApiUrl, useMockApi } from '../../config.ts';
import { useLoader } from '../../components/Loader/Loader.tsx';
import ApiService from '@shared/services/ApiService';
import StorageService from '@shared/services/StorageService';
import Logo from '../../components/Logo/Logo.tsx';
import Input from '../../components/FormFields/Input/Input.tsx';
import translations from '../../translations/translations.ts';

const SessionInitialState = {
    clientSessionId: '',
    clientApiUrl: '',
    customerId: '',
    assetUrl: ''
} satisfies Partial<SessionDetails>;

const SessionPage = () => {
    const apiService = ApiService(mockApiUrl);
    const [errorMessage, setErrorMessage] = useState<string>();

    const navigate = useNavigate();

    const [sessionDetails, setSessionDetails] = useState<Partial<SessionDetails>>({ ...SessionInitialState });

    const { show, hide } = useLoader();

    useEffect(() => {
        if (StorageService.getSession()) {
            setSessionDetails(StorageService.getSession()!);
        }
    }, []);

    const fetchSessionFromAPI = async () => {
        show();
        let errorMessage = '';

        apiService
            .getSession()
            .then((response) => setSessionDetails?.(response))
            .catch((error: ErrorResponseJSON) => {
                if (error.errors?.length) {
                    errorMessage =
                        translations.errors_while_fetching_data + error.errors.map((error) => error.message).join(', ');
                } else {
                    errorMessage = translations.there_was_an_error_fetching_data_did_you_mock_api;
                }
            })
            .finally(() => {
                setErrorMessage(errorMessage);
                hide();
            });
    };

    const pasteData = () => {
        let error = '';
        navigator.clipboard.readText().then((text) => {
            try {
                const data = JSON.parse(text);
                if (data?.assetUrl && data.clientApiUrl && data.clientSessionId && data.customerId) {
                    setSessionDetails?.({
                        assetUrl: data.assetUrl,
                        clientApiUrl: data.clientApiUrl,
                        clientSessionId: data.clientSessionId,
                        customerId: data.customerId
                    });
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                error = translations.the_clipboard_does_not_contain_valid_data;
            }

            setErrorMessage(error);
        });
    };

    const handleChangeSessionDetails = (value: string, prop: keyof SessionDetails) => {
        setSessionDetails?.((prev) => ({
            ...prev,
            [prop]: value
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (
            !sessionDetails?.assetUrl ||
            !sessionDetails.clientApiUrl ||
            !sessionDetails.clientSessionId ||
            !sessionDetails.customerId
        ) {
            setErrorMessage(translations.please_fill_in_all_the_data);
        } else {
            StorageService.clear();
            StorageService.setSession(sessionDetails as SessionDetails);

            navigate('/payment');
        }
    };

    return (
        <div className='page'>
            <Logo />
            <h1>{translations.initialize_session}</h1>
            <p>
                {translations.to_process_the_payment_using_services_provided_by_the_online_payments_platform +
                    translations.information_must_be_provided_as_a_merchant}
            </p>
            <div className='flex column mt-1'>
                <form className='form' id='sessionForm' onSubmit={handleSubmit}>
                    <Input
                        label={translations.asset_url}
                        id='assetUrl'
                        type='url'
                        required={true}
                        value={sessionDetails?.assetUrl}
                        onChange={(e) => handleChangeSessionDetails(e, 'assetUrl')}
                    />
                    <Input
                        label={translations.client_api_url}
                        id='clientApiUrl'
                        type='url'
                        required={true}
                        value={sessionDetails?.clientApiUrl}
                        onChange={(e) => handleChangeSessionDetails(e, 'clientApiUrl')}
                    />
                    <Input
                        label={translations.client_session_id}
                        id='clientSessionId'
                        type='text'
                        required={true}
                        value={sessionDetails?.clientSessionId}
                        onChange={(e) => handleChangeSessionDetails(e, 'clientSessionId')}
                    />
                    <Input
                        label={translations.customer_id}
                        id='customerId'
                        type='text'
                        required={true}
                        value={sessionDetails?.customerId}
                        onChange={(e) => handleChangeSessionDetails(e, 'customerId')}
                    />
                    <button className='button primary' type='submit'>
                        {translations.start_session}
                    </button>
                </form>
                <div className='label'>{translations.get_session_details_from}</div>
                <div className='flex row center'>
                    <button className='button' type='button' onClick={pasteData}>
                        {translations.clipboard}
                    </button>
                    {useMockApi && (
                        <button className='button' type='button' onClick={fetchSessionFromAPI}>
                            {translations.mock_api}
                        </button>
                    )}
                </div>
            </div>
            <div className='error mt-1' id='errorMessage'>
                {errorMessage}
            </div>
        </div>
    );
};

export default SessionPage;
