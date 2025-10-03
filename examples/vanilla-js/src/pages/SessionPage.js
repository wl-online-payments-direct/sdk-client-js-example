import * as sdk from 'onlinepayments-sdk-client-js';

import ApiService from '../services/ApiService.js';
import Loader from '../components/Loader.js';
import FormField from '../components/FormField.js';
import Logo from '../components/Logo.js';
import StorageService from '../services/StorageService.js';
import Pages from '../constants/pages.js';
import { UseMockApi } from '../config.js';

/**
 * Represents the session initialization page for setting up payment session details.
 * Provides a form interface for users to input necessary data and manages associated
 * events, validation, and form population. The page allows users to fill session data
 * from a clipboard or a mock API and initializes a session for further payment processing.
 *
 * @returns {{mount: ((function(HTMLElement): Promise<void>)|*)}}
 * @constructor
 */
const SessionPage = () => {
    let assetUrlField;
    let clientApiUrlField;
    let clientSessionIdField;
    let customerIdField;
    let errorMessageElement;

    /**
     * Page HTML.
     *
     * @type {string}
     */
    const template = `
        <div class="page">
            ${Logo.render()}
            <h1>Initialize session</h1>
            <p>
                To process the payment using the services provided by the Online Payments platform,
                the following information must be provided as a merchant.
            </p>
            <form class="form" id="sessionForm">
                ${FormField.getInputField('Asset URL', 'assetUrl', 'url', true)}
                ${FormField.getInputField('Client API URL', 'clientApiUrl', 'url', true)}
                ${FormField.getInputField('Client Session ID', 'clientSessionId', 'text', true)}
                ${FormField.getInputField('Customer ID', 'customerId', 'text', true)}
                <button class="button primary" type="submit">Start session</button>
            </form>
            <div class="flex column mt-1">
                <div class="label">Get session details from: </div>
                <div class="flex row center">
                    <button class="button" id="fillFromClipboard" type="button">Clipboard</button>
                    ${UseMockApi ? '<button class="button" id="fillFromApi" type="button">Mock API</button>' : ''}
                </div>
            </div>
            <div class="error mt-1" id="errorMessage"></div>
        </div>`;

    /**
     * Populates form fields with the given data object.
     *
     * @param {sdk.SessionDetails} data - An object containing the values to set in the form.
     * @param {string} data.assetUrl - The value to set for the asset URL field.
     * @param {string} data.clientApiUrl - The value to set for the client API URL field.
     * @param {string} data.clientSessionId - The value to set for the client session ID field.
     * @param {string} data.customerId - The value to set for the customer ID field.
     */
    const fillForm = (data) => {
        assetUrlField.value = data.assetUrl;
        clientApiUrlField.value = data.clientApiUrl;
        clientSessionIdField.value = data.clientSessionId;
        customerIdField.value = data.customerId;
    };

    /**
     * Updates the error message displayed to the user.
     *
     * @param {string} errorMessage - The error message to be displayed.
     */
    const setError = (errorMessage) => {
        errorMessageElement.textContent = errorMessage;
    };

    /**
     * Reads text data from the user's clipboard, parses it as JSON,
     * and attempts to fill a form with the parsed data if it contains
     * the required properties. If the data is invalid or does not
     * contain the necessary properties, an error message is set.
     *
     * The expected structure of the clipboard JSON data includes the following properties:
     * - assetUrl
     * - clientApiUrl
     * - clientSessionId
     * - customerId
     *
     * If any of these properties are missing, an error is triggered.
     */
    const pasteData = () => {
        navigator.clipboard.readText().then((text) => {
            setError('');

            try {
                const data = JSON.parse(text);
                if (data?.assetUrl && data.clientApiUrl && data.clientSessionId && data.customerId) {
                    fillForm(data);
                    return;
                }
            } catch (e) {}

            setError('The clipboard does not contain valid data.');
        });
    };

    /**
     * Asynchronous function to fetch data from an API and populate a form.
     * If an error occurs during the API call, an appropriate error message will be displayed.
     */
    const fetchFromAPI = async () => {
        let errorMessage = '';

        Loader.show();
        ApiService.getSession()
            .then(fillForm)
            .catch((error) => {
                if (error.errors?.length) {
                    errorMessage =
                        'Errors while fetching the data: ' + error.errors.map((error) => error.message).join(', ');
                } else {
                    errorMessage = 'There was an error fetching data. Did you start the mock API?';
                }
            })
            .finally(() => {
                setError(errorMessage);
                Loader.hide();
            });
    };

    /**
     * Handles the initiation of the payment process.
     * Initializes a payment session if data is valid. If invalid,
     * sets an error message. Clears existing session data and stores new
     * session details upon successful initialization, then navigates to
     * the payment page.
     *
     * @param {Event} e - The event object from the form submission.
     */
    const startPayment = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!assetUrlField.value || !clientApiUrlField.value || !clientSessionIdField.value || !customerIdField.value) {
            setError('Please fill in all the data.');
        } else {
            const sessionDetails = {
                assetUrl: assetUrlField.value,
                clientApiUrl: clientApiUrlField.value,
                clientSessionId: clientSessionIdField.value,
                customerId: customerIdField.value
            };

            try {
                new sdk.Session(sessionDetails);
                StorageService.clear();
                StorageService.setSessionDetails(sessionDetails);
                window.location.href = Pages.Payment;
            } catch (e) {
                setError(e.message);
            }
        }
    };

    /**
     * Initializes the necessary fields and event listeners for the session management form.
     */
    const init = () => {
        assetUrlField = document.getElementById('assetUrl');
        clientApiUrlField = document.getElementById('clientApiUrl');
        clientSessionIdField = document.getElementById('clientSessionId');
        customerIdField = document.getElementById('customerId');
        errorMessageElement = document.getElementById('errorMessage');

        const sessionDetails = StorageService.getSessionDetails();
        if (sessionDetails) {
            fillForm(sessionDetails);
        }

        document.getElementById('fillFromClipboard').addEventListener('click', pasteData);
        document.getElementById('fillFromApi')?.addEventListener('click', fetchFromAPI);
        document.getElementById('sessionForm').addEventListener('submit', startPayment);
    };

    /**
     * Mounts the page to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        mountingPoint.innerHTML = template;
        init();
    };

    return {
        mount
    };
};

export default SessionPage();
