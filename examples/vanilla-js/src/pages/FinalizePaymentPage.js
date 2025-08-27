import Logo from '../components/Logo.js';
import StorageService from '../utilities/StorageService.js';
import Pages from '../constants/pages.js';
import { UseMockApi } from '../config.js';
import Loader from '../components/Loader.js';
import ApiService from '../utilities/ApiService.js';

/**
 * Represents the FinalizePaymentPage component, responsible for rendering the final payment page
 * interface, handling encrypted payment data display, and interacting with the API to process payments.
 * Includes functionality for mounting the page, handling API calls for payment processing, and
 * managing session and navigation logic.
 *
 * @returns {{mount: ((function(HTMLElement): Promise<void>)|*)}}
 * @constructor
 */
const FinalizePaymentPage = () => {
    /**
     * Returns the page HTML.
     * @param title
     * @param encryptedData
     * @returns {string}
     */
    const renderPage = (title, encryptedData) => {
        return `
            <div class="page">
                ${Logo.render()}
                <h1>Complete payment</h1>
                <div class="form">
                    <div class="label">${title}</div>
                    <textarea class="small" rows="10" aria-autocomplete='none' aria-multiline="false"
                            autoCapitalize='off' autoCorrect='off' data-enable-grammarly="false"
                            data-gramm="false" spellCheck="false">${encryptedData}</textarea>
                    ${UseMockApi ? `<button class="button primary" type="button" id="submit">Submit to Mock API</button>` : ''}
                    <div class="error" id="error"></div>
                    <div id="apiResponse" style="display: none;">
                        <div class="label">Payment response:</div>
                        <textarea class="small" rows="10" aria-autocomplete='none' aria-multiline="false"
                            autoCapitalize='off' autoCorrect='off' data-enable-grammarly="false"
                            data-gramm="false" spellCheck="false"></textarea>
                    </div>
                </div>
                <button class="button primary mt-1" type="button" id="restart">Restart session</button>
                <div class="flex column start mt-1">
                    <span>To learn more about creating payment, check the following links:</span>
                    <a class="button link" href="https://docs.direct.worldline-solutions.com/en/api-reference#tag/Payments/operation/CreatePaymentApi">
                        Create Payment API documentation
                    </a>
                    <a class="button link" href="https://docs.direct.worldline-solutions.com/en/integration/basic-integration-methods/server-to-server">
                        Server-to-server integration
                    </a>
                </div>
            </div>
        `;
    };

    /**
     * Calls the mock API with the encrypted data and displays the result.
     *
     * @returns {Promise<void>}
     */
    const processPayment = async () => {
        let errorMessage = '';
        const apiResponsePlaceholder = document.getElementById('apiResponse');
        apiResponsePlaceholder.style.display = 'none';

        Loader.show();
        const payment = StorageService.getPaymentContext();
        ApiService.createPayment({
            ...payment,
            ...(StorageService.getCardPaymentSpecificData() && StorageService.getAccountOnFileId()
                ? { ...StorageService.getCardPaymentSpecificData() }
                : { data: StorageService.getEncryptedData() })
        })
            .then((response) => {
                apiResponsePlaceholder.style.display = 'block';
                apiResponsePlaceholder.querySelector('textarea').value = JSON.stringify(response, null, 2);
            })
            .catch((error) => {
                if (error.errors?.length) {
                    errorMessage =
                        'Errors while submitting the data: ' + error.errors.map((error) => error.message).join(', ');
                } else {
                    errorMessage = 'There was an error while submitting the data. Did you start the mock API?';
                }
            })
            .finally(() => {
                document.getElementById('error').innerHTML = errorMessage;
                Loader.hide();
            });
    };

    /**
     * Mounts the page to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        if (!StorageService.getSession()) {
            window.location = Pages.Home;
        } else if (
            !StorageService.getPaymentProduct() ||
            (!StorageService.getEncryptedData() && !StorageService.getCardPaymentSpecificData())
        ) {
            window.location = Pages.Payment;
        } else {
            if (StorageService.getCardPaymentSpecificData()) {
                mountingPoint.innerHTML = renderPage(
                    'Object:',
                    JSON.stringify(StorageService.getCardPaymentSpecificData())
                );
            } else {
                mountingPoint.innerHTML = renderPage('Encrypted string:', StorageService.getEncryptedData());
            }

            document.getElementById('submit')?.addEventListener('click', processPayment);
            document.getElementById('restart').addEventListener('click', () => {
                StorageService.clear();
                window.location.href = Pages.Home;
            });
        }
    };

    return { mount };
};

export default FinalizePaymentPage();
