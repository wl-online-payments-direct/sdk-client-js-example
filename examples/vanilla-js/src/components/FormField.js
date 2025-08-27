/**
 * A form field component. Renders different form fields.
 *
 * @constructor
 */
const FormField = () => {
    /**
     * Converts object attributes to HTML attributes string
     * @param {object} attributes
     * @returns {string}
     */
    const getFieldAttributes = (attributes) => {
        let result = '';
        Object.entries(attributes || {}).forEach(([key, value]) => {
            result += ` ${key}="${value}"`;
        });

        return result;
    };

    /**
     * Renders an input field.
     *
     * @param {string} label
     * @param {string} id
     * @param {string} type
     * @param {boolean} required
     * @param {object} fieldAttrs
     * @param {string} value
     * @param {boolean} disabled
     * @returns {string} HTML representation of an input field
     */
    const getInputField = (label, id, type = 'text', required = false, fieldAttrs = {}, value = '', disabled = false) => {
        return `<div class="field ${fieldAttrs.class || ''}" id="${id}Field">
            <label for="${id}">${label}</label>
            <input type="${type}" id="${id}" name="${id}" ${required && 'required'} value="${value}" ${disabled && 'disabled'} ${getFieldAttributes(fieldAttrs)}
                aria-autocomplete='none' aria-multiline="false" autoCapitalize='off' autoCorrect='off'
                data-enable-grammarly="false" data-gramm="false" spellCheck="false" />
        </div>`;
    };

    /**
     * Renders a select field.
     *
     * @param {string} label
     * @param {string} id
     * @param {{ value: string,label: string, selected?: boolean }[]} options
     * @param {boolean} required
     * @param {object} fieldAttrs
     * @returns {string} HTML representation of a select field
     */
    const getSelectField = (label, id, options, required = false, fieldAttrs = {}) => {
        return `<div class="field ${fieldAttrs.class || ''}" id="${id}Field">
            <label for="${id}">${label}</label>
            <select id="${id}" name="${id}" ${required && 'required'} ${getFieldAttributes(fieldAttrs)}>
                ${options.map((option) => `<option value="${option.value}" ${option.selected ? 'selected' : ''}>${option.label}</option>`).join('')}
            </select>
        </div>`;
    };

    /**
     * Renders a checkbox field.
     *
     * @param {string} label
     * @param {string} id
     * @param {boolean} checked
     * @param {object} fieldAttrs
     * @returns {string} HTML representation of a select field
     */
    const getCheckboxField = (label, id, checked = false, fieldAttrs = {}) => {
        return `<div class="field ${fieldAttrs.class || ''}" id="${id}Field">
            <label class="checkbox">
                <input type="checkbox" id="${id}" name="${id}" ${checked ? 'checked' : ''} ${getFieldAttributes(fieldAttrs)} />
                <span></span>
                <span>${label}</span>
            </label>
        </div>`;
    };

    /**
     * Renders a radio field.
     *
     * @param {string} label
     * @param {string} name
     * @param {string} value
     * @param {boolean} checked
     * @param {object} fieldAttrs
     * @returns {string} HTML representation of a select field
     */
    const getRadioField = (label, name, value = '', checked = false, fieldAttrs = {}) => {
        return `<div class="field ${fieldAttrs.class || ''}">
            <label class="radio">
                <input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}" ${getFieldAttributes(fieldAttrs)} />
                <span></span>
                <span>${label}</span>
            </label>
        </div>`;
    };

    return {
        getInputField,
        getSelectField,
        getCheckboxField,
        getRadioField
    };
};

export default FormField();
