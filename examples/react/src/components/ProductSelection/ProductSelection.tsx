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
