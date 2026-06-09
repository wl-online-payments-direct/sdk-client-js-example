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
import type { Base } from '../types.ts';
import type { ChangeEvent } from 'react';

type Option = {
    label: string;
    value: string;
};

type Props = Base & {
    required?: boolean;
    value?: string;
    options: Option[];
    onChange?: (value: string) => void;
};

const Select = ({
    label,
    id,
    onChange,
    options,
    value,
    disabled = false,
    required = false,
    fieldAttrs = {}
}: Props) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
            <label htmlFor={id}>{label}</label>
            <select
                id={id}
                name={id}
                required={required}
                {...fieldAttrs}
                onChange={handleChange}
                value={value}
                disabled={disabled}
            >
                {options.map((option) => (
                    <option value={option.value} key={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
