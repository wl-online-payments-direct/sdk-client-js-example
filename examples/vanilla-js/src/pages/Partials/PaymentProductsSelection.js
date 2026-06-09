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
// noinspection ES6UnusedImports
import * as sdk from 'onlinepayments-sdk-client-js';
import FormField from '../../components/FormField.js';

/**
 * The component that displays payment product selection.
 *
 * @param {sdk.BasicPaymentProduct[] | undefined} products
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
                    ?.map((product) => {
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
