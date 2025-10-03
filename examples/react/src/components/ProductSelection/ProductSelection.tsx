import type { BasicPaymentItem } from 'onlinepayments-sdk-client-js';
import Radio from '../FormFields/Radio/Radio.tsx';
import translations from '../../translations/translations.ts';

type Props = {
    items: BasicPaymentItem[];
    onSelectedProduct: (id: string) => Promise<void>;
};

const ProductSelection = ({ items, onSelectedProduct }: Props) => {
    const mappedItems = items.map((payment) => ({
        id: payment.id,
        label: payment.json.displayHints.label,
        logo: payment.json.displayHints.logo,
        accountsOnFile: payment.accountsOnFile || []
    }));

    return (
        <div className='flex-expand'>
            <p className='text-left'>{translations.select_payment_method}</p>
            <form className='form' id='paymentSelectionForm'>
                {mappedItems.map((product) => {
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
