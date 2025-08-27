import FormField from '../../components/FormField.js';

/**
 * The component that displays payment product selection.
 *
 * @param {{label: string, id: string}[]} products
 * @param {(productId: string) => void} onPaymentProductSelected
 * @returns {{mount: (mountingPoint: HTMLElement) => void}}
 * @constructor
 */
const PaymentProductsSelection = (products, onPaymentProductSelected) => {
    /**
     * The component HTML.
     *
     * @type {string}
     */
    const template = products?.length
        ? `
            <p class="text-left">Select payment method:</p>
            <form class="form" id="paymentSelectionForm">
                ${products
                    .map((product) => {
                        return FormField.getRadioField(product.label, 'paymentMethod', product.id);
                    })
                    .join('')}
            </form>`
        : '';

    /**
     * Mounts the component to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        mountingPoint.innerHTML = template;
        document.getElementById('paymentSelectionForm')?.addEventListener('change', (event) => {
            if (event.target.name === 'paymentMethod' && event.target.checked) {
                onPaymentProductSelected(event.target.value);
            }
        });
    };

    return { mount };
};

export default PaymentProductsSelection;
