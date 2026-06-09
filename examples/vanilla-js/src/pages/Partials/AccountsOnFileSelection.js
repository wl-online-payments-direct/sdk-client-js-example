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
import FormField from '../../components/FormField.js';

/**
 * Renders a component for selecting AOF.
 *
 * @param {[]} accounts
 * @param {(acountOnFileId: string) => void} onAccountOnFileSelected
 * @returns {{mount: (mountingPoint: HTMLElement) => void}}
 * @constructor
 */
const AccountsOnFileSelection = (accounts, onAccountOnFileSelected) => {
    /**
     * The component HTML.
     *
     * @type {string}
     */
    const template = `
            <p class="text-left">or use saved method:</p>
            <form class="form" id="aofSelectionForm">
                ${accounts
                    .map((aof) => {
                        return FormField.getRadioField(aof.label, 'aof', aof.id);
                    })
                    .join('')}
            </form>
        `;

    /**
     * Mounts the component to the mounting point.
     *
     * @param {HTMLElement} mountingPoint
     */
    const mount = (mountingPoint) => {
        mountingPoint.innerHTML = template;
        document.getElementById('aofSelectionForm').addEventListener('change', (event) => {
            if (event.target.name === 'aof' && event.target.checked) {
                onAccountOnFileSelected(event.target.value);
            }
        });
    };

    return { mount };
};

export default AccountsOnFileSelection;
