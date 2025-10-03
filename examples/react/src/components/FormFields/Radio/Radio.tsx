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
