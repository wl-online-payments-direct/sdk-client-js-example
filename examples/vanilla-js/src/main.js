import sessionPage from './pages/SessionPage.js';
import paymentPage from './pages/PaymentSelectionPage.js';
import creditCardPage from './pages/CreditCardPage.js';
import accountOnFilePage from './pages/AccountOnFilePage.js';
import finalizePaymentPage from './pages/FinalizePaymentPage.js';
import googlePayPage from './pages/GooglePayPage.js';
import Pages from './constants/pages.js';
import StorageService from './utilities/StorageService.js';

const handleRouteChange = () => {
    renderPage(window.location.hash).then();
};

/**
 * A method for rendering a page based on the URL hash.
 *
 * @param {string} hash
 * @returns {Promise<void>}
 */
const renderPage = async (hash) => {
    const content = document.getElementById('app');
    const page = `/${hash}`;

    try {
        switch (page) {
            case '/':
                window.location.hash = Pages.Home.substring(1);
                return;
            case Pages.Home:
                await sessionPage.mount(content);
                return;
            case Pages.Payment:
                await paymentPage.mount(content);
                return;
            case Pages.CreditCard:
                await creditCardPage.mount(content);
                return;
            case Pages.AccountOnFile:
                await accountOnFilePage.mount(content);
                return;
            case Pages.GooglePay:
                await googlePayPage.mount(content);
                return;
            case Pages.Finalize:
                await finalizePaymentPage.mount(content);
                return;
        }
    } catch (e) {
        if (e.response?.status === 403) {
            StorageService.clear();
            window.location.href = Pages.Home;
            return;
        } else {
            throw e;
        }
    }

    content.innerHTML = '<div class="flex center flex-expand"><h1>404 - Page Not Found</h1></div>';
};

const handleThemeChange = () => {
    document.addEventListener('DOMContentLoaded', () => {
        const switcher = document.getElementById('theme-switcher');

        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            switcher.dataset.value = theme;
            localStorage.setItem('theme', theme);
        };

        // Initialize based on saved theme or system default
        const savedTheme =
            localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);

        switcher.addEventListener('click', () => {
            applyTheme(switcher.dataset.value === 'dark' ? 'light' : 'dark');
        });
    });
};

const start = () => {
    handleRouteChange();
    handleThemeChange();

    window.addEventListener('hashchange', handleRouteChange);
};

start();
