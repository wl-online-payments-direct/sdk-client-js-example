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
