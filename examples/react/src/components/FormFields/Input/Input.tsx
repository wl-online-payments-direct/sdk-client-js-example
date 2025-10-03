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
