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
    checked?: boolean;
    value?: string;
    name: string;
    onChange?: (value: string) => void;
};

const Radio = ({ label, id, name, onChange, checked, disabled = false, value = '', fieldAttrs = {} }: Props) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
            <label className='radio'>
                <input
                    type='radio'
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...fieldAttrs}
                />
                <span></span>
                <span>{label}</span>
            </label>
        </div>
    );
};

export default Radio;
