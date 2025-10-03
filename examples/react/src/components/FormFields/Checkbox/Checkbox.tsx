import type { ChangeEvent } from 'react';
import type { Base } from '../types.ts';

type Props = Base & {
    checked?: boolean;
    onChange?: (value: boolean) => void;
};

const Checkbox = ({ label, id, onChange, checked, fieldAttrs = {} }: Props) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.checked);
    };

    return (
        <div className={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
            <label className='checkbox'>
                <input type='checkbox' id={id} name={id} checked={checked} onChange={handleChange} {...fieldAttrs} />
                <span></span>
                <span>{label}</span>
            </label>
        </div>
    );
};

export default Checkbox;
