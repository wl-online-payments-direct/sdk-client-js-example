<script lang="ts">
    import Input from '../FormFields/Input/Input.svelte';
    import Select from '../FormFields/Select/Select.svelte';
    import Checkbox from '../FormFields/Checkbox/Checkbox.svelte';
    import type { PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
    import countries from '@shared/constants/countries';
    import currencies from '@shared/constants/currencies';
    import { translations } from '../../translations/translations';
    import type DeepPartial from '@shared/types/DeepPartial';

    export let paymentContext: DeepPartial<PaymentContextWithAmount> | undefined = {};
    export let isFormExpanded: boolean = true;
    export let onExpandCollapse: () => void;
    /**
     * Callback fired when the context is valid and should be persisted.
     * @param context - The current payment context.
     */
    export let onSaveContextToStorage: (context: PaymentContextWithAmount) => void;

    /**
     * Handles form submission: prevents default behavior,
     * triggers expand/collapse, and persists the context if valid.
     */
    const handleSubmit = (e: Event) => {
        e.preventDefault();
        onExpandCollapse?.();

        if (
            paymentContext?.countryCode &&
            paymentContext?.amountOfMoney?.currencyCode &&
            paymentContext?.amountOfMoney?.amount != null
        ) {
            onSaveContextToStorage?.({ ...paymentContext } as PaymentContextWithAmount);
        }
    };

    const handleInput = (e:Event) => {
        const val = (e.target as HTMLInputElement)?.value;
        if (paymentContext && paymentContext.amountOfMoney) {
            paymentContext.amountOfMoney.amount = val ? Number(val) : 0;
        }
    }
</script>

<div>
    <p class='text-left'>Order details:</p>
    <button
        class="button expand-button {isFormExpanded ? '' : 'show'}"
        class:show={!isFormExpanded}
        type="button"
        id='paymentDetailsFormExpandButton'
        on:click={onExpandCollapse}
    >
        {translations.expand}
    </button>

    <form
        class="form"
        class:collapse={!isFormExpanded}
        id="paymentDetailsForm"
        on:submit={handleSubmit}
    >
        <Input
            id="amount"
            label={translations.amount_in_the_smallest_denominator}
            type="number"
            required
            value={paymentContext?.amountOfMoney?.amount?.toString() ?? ''}
            on:input={handleInput}
            fieldAttrs={{ step: '1' }}
        />

        <Select
            id="countryCode"
            label={translations.country}
            required
            options={countries}
            bind:value={paymentContext!.countryCode}
        />

        <Select
            id="currency"
            label={translations.currency}
            required
            options={currencies}
            bind:value={paymentContext!.amountOfMoney!.currencyCode}
        />

        <Checkbox
            id="isRecurring"
            label={translations.is_recurring_payment}
            bind:checked={paymentContext!.isRecurring}
        />

        <button class="button primary" type="submit">
            {translations.get_payment_methods}
        </button>

        <div class="errorMessage" id="paymentDetailsErrorMessage"></div>
    </form>
</div>

<style>
    #paymentDetailsFormExpandButton {
        display: none;
        width: 75px;
        align-self: flex-end;
    }

    #paymentDetailsFormExpandButton.show {
        display: block;
    }

    #paymentDetailsForm {
        overflow: hidden;
        max-height: 600px;
        transition: all 0.2s linear;
    }

    #paymentDetailsForm.collapse {
        max-height: 0;
        padding: 0;
    }
</style>
