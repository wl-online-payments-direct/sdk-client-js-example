import type { CardPaymentSpecificData } from '../types/CreatePaymentRequest';
import { type PaymentContextWithAmount, type PaymentRequest, type SessionData } from 'onlinepayments-sdk-client-js';

const STORAGE_KEY = 'sdk-example-app-storage';

export type PaymentInfo = {
    tokenize: boolean;
    [key: string]: string | boolean | undefined;
};

const LocalStorageInitialData = {
    session: null,
    paymentContext: null,
    paymentProductId: null,
    accountOnFileId: null,
    encryptedData: null,
    cardPaymentSpecificData: null,
    paymentRequest: null
};

type Storage = {
    sessionData: SessionData | null;
    paymentContext: PaymentContextWithAmount | null;
    paymentProductId: number | null;
    accountOnFileId: string | null;
    encryptedData: string | null;
    cardPaymentSpecificData: CardPaymentSpecificData | null;
    paymentRequest: PaymentInfo | null;
};

const StorageService = () => {
    const getStorage = () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            clear();
        }

        return JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    };

    const setItem = <K extends keyof Storage>(key: K, value: Storage[K]): void => {
        const storage = getStorage();
        storage[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    };

    const getItem = <K extends keyof Storage>(key: K) => {
        return getStorage()[key];
    };

    const clear = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                ...LocalStorageInitialData
            })
        );
    };

    const clearItem = <K extends keyof Storage>(key: K) => {
        setItem(key, null);
    };

    const setSession = (value: Storage['sessionData']) => {
        setItem('sessionData', value);
    };

    const setPaymentContext = (value: Storage['paymentContext']) => {
        setItem('paymentContext', value);
    };

    const setPaymentProductId = (value: Storage['paymentProductId']) => {
        setItem('paymentProductId', value);
    };

    const setAccountOnFileId = (value: Storage['accountOnFileId']) => {
        setItem('accountOnFileId', value);
    };

    const setEncryptedData = (value: Storage['encryptedData']) => {
        setItem('encryptedData', value);
    };

    const setCardPaymentSpecificData = (value: Storage['cardPaymentSpecificData']) => {
        setItem('cardPaymentSpecificData', value);
    };

    const setPaymentRequest = (value: PaymentRequest) => {
        setItem('paymentRequest', {
            ...value?.getValues(),
            tokenize: value?.getTokenize()
        });
    };

    const getSessionData = (): Storage['sessionData'] => {
        return getItem('sessionData');
    };

    const getPaymentContext = (): Storage['paymentContext'] => {
        return getItem('paymentContext');
    };

    const getPaymentProductId = (): Storage['paymentProductId'] => {
        return getItem('paymentProductId');
    };

    const getAccountOnFileId = (): Storage['accountOnFileId'] => {
        return getItem('accountOnFileId');
    };

    const getEncryptedData = (): Storage['encryptedData'] => {
        return getItem('encryptedData');
    };

    const getCardPaymentSpecificData = (): Storage['cardPaymentSpecificData'] => {
        return getItem('cardPaymentSpecificData');
    };

    const getPaymentRequest = (): Storage['paymentRequest'] => {
        return getItem('paymentRequest');
    };

    return {
        getStorage,
        getSessionData,
        getAccountOnFileId,
        getEncryptedData,
        getCardPaymentSpecificData,
        getPaymentContext,
        getPaymentProductId,
        setSession,
        setPaymentContext,
        setAccountOnFileId,
        setPaymentProductId,
        setEncryptedData,
        setCardPaymentSpecificData,
        getPaymentRequest,
        setPaymentRequest,
        clearItem,
        clear
    };
};

export default StorageService();
