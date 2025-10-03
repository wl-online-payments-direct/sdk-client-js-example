import Logo from '../../components/Logo/Logo.tsx';
import { mockApiUrl, useMockApi } from '../../config.ts';
import { useEffect, useRef, useState } from 'react';
import { type ErrorResponseJSON, type PaymentContextWithAmount, Session } from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import { useLoader } from '../../components/Loader/Loader.tsx';
import { useNavigate } from 'react-router-dom';
import ApiService from '@shared/services/ApiService';
import translations from '../../translations/translations.ts';
import { createPaymentApiDocumentationLink, serverToServerDocumentationLink } from '@shared/constants/links';
import type { EncryptedData } from '@shared/types/CreatePaymentRequest';

type PaymentData = {
    type: 'encrypted' | 'raw';
    data: string;
};

const FinalizePaymentPage = () => {
    const session = useRef<Session>(null);

    const { show, hide } = useLoader();
    const navigate = useNavigate();

    const [paymentContext, setPaymentContext] = useState<PaymentContextWithAmount>();

    const [paymentData, setPaymentData] = useState<PaymentData>();
    const [paymentResponse, setPaymentResponse] = useState('');

    const [errorMessage, setErrorMessage] = useState<string>('');

    const [paymentRequest] = useState(() => JSON.stringify(StorageService.getPaymentRequest() ?? '', null, 2));

    useEffect(() => {
        show();
        if (!StorageService.getSession()) {
            hide();
            navigate('/');
        } else {
            session.current = new Session(StorageService.getSession()!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (
            !StorageService.getPaymentProduct() ||
            (!StorageService.getEncryptedData() && !StorageService.getCardPaymentSpecificData())
        ) {
            hide();
            navigate(`/payment/`);
            return;
        }

        if (StorageService.getCardPaymentSpecificData()) {
            setPaymentData({
                type: 'raw',
                data: JSON.stringify(StorageService.getCardPaymentSpecificData(), null, 2)
            });
        } else {
            setPaymentData({ type: 'encrypted', data: StorageService.getEncryptedData() ?? '' });
        }

        if (StorageService.getPaymentContext()) {
            setPaymentContext(StorageService.getPaymentContext()!);
        }

        hide();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRestartSession = () => {
        StorageService.clear();
        navigate('/');
    };

    const processPayment = async () => {
        let errorMessage = '';
        const apiService = ApiService(mockApiUrl);

        show();
        apiService
            .createPayment({
                ...paymentContext,
                ...((StorageService.getCardPaymentSpecificData() && StorageService.getAccountOnFileId()
                    ? { ...StorageService.getCardPaymentSpecificData() }
                    : { data: StorageService.getEncryptedData() }) as EncryptedData)
            })
            .then((response) => {
                setPaymentResponse(JSON.stringify(response, null, 2));
            })
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

    return (
        <div className='page'>
            <Logo />
            <h1>{translations.complete_payment}</h1>
            <div className='form'>
                <div className='label'>{translations.payment_request}</div>
                <textarea
                    className='small'
                    rows={10}
                    aria-autocomplete='none'
                    aria-multiline='true'
                    autoCapitalize='off'
                    autoCorrect='off'
                    data-enable-grammarly='false'
                    data-gramm='false'
                    spellCheck='false'
                    defaultValue={paymentRequest}
                />
                <>
                    <div className='label'>
                        {paymentData?.type === 'raw' ? translations.payload : translations.encrypted_string}
                    </div>
                    <textarea
                        className='small'
                        rows={10}
                        aria-autocomplete='none'
                        aria-multiline='false'
                        autoCapitalize='off'
                        autoCorrect='off'
                        data-enable-grammarly='false'
                        data-gramm='false'
                        spellCheck='false'
                        defaultValue={paymentData?.data}
                    />
                </>
                {useMockApi && (
                    <button className='button primary' type='button' onClick={processPayment}>
                        {translations.submit_to_mock_api}
                    </button>
                )}
                <div className='error'>{errorMessage}</div>
                {paymentResponse && (
                    <div>
                        <div className='label'>{translations.payment_response}</div>
                        <textarea
                            className='small'
                            rows={10}
                            aria-autocomplete='none'
                            aria-multiline='false'
                            autoCapitalize='off'
                            autoCorrect='off'
                            data-enable-grammarly='false'
                            data-gramm='false'
                            spellCheck='false'
                            defaultValue={paymentResponse ?? ''}
                        />
                    </div>
                )}
            </div>
            <button className='button primary mt-1' type='button' onClick={handleRestartSession}>
                {translations.restart_session}
            </button>
            <div className='flex column start mt-1'>
                <span>{translations.to_learn_more_about_creating_payment_check_the_following_link}</span>
                <a className='button link' href={createPaymentApiDocumentationLink}>
                    {translations.create_payment_api_documentation}
                </a>
                <a className='button link' href={serverToServerDocumentationLink}>
                    {translations.server_to_server_integration}
                </a>
            </div>
        </div>
    );
};

export default FinalizePaymentPage;
