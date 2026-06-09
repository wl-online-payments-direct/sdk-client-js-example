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
import type { ChangeEvent } from 'react';
import type { Base } from '../types.ts';

type Props = Base & {
    required?: boolean;
    value?: string;
    type: 'text' | 'url' | 'number';
    onChange?: (value: string) => void;
};

const Input = ({
    label,
    id,
    onChange,
    type = 'text',
    value = '',
    disabled = false,
    required = false,
    fieldAttrs = {}
}: Props) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                value={value}
                name={id}
                required={required}
                aria-autocomplete='none'
                aria-multiline='false'
                autoCapitalize='off'
                autoCorrect='off'
                data-enable-grammarly='false'
                data-gramm='false'
                spellCheck='false'
                onChange={handleChange}
                disabled={disabled}
                {...fieldAttrs}
            />
        </div>
    );
};

export default Input;
