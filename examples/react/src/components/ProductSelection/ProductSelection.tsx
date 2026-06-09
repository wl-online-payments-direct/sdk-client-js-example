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
import { type BasicPaymentProduct } from 'onlinepayments-sdk-client-js';
import Radio from '../FormFields/Radio/Radio.tsx';
import translations from '../../translations/translations.ts';

type Props = {
    products: BasicPaymentProduct[];
    onSelectedProduct: (id: string) => Promise<void>;
};

const ProductSelection = ({ products, onSelectedProduct }: Props) => {
    return (
        <div className='flex-expand'>
            <p className='text-left'>{translations.select_payment_method}</p>
            <form className='form' id='paymentSelectionForm'>
                {products.map((product) => {
                    return (
                        <Radio
                            key={product.id}
                            id={product.id.toString()}
                            name='paymentMethod'
                            label={product.label}
                            value={product.id.toString()}
                            onChange={onSelectedProduct}
                        />
                    );
                })}
            </form>
        </div>
    );
};

export default ProductSelection;
