import { AccountOnFile } from 'onlinepayments-sdk-client-js';
import Radio from '../FormFields/Radio/Radio.tsx';
import translations from '../../translations/translations.ts';

type Props = {
    accountsOnFile: AccountOnFile[];
    onSelectedProduct: (id: string) => Promise<void>;
};

const AccountOnFileSelection = ({ accountsOnFile, onSelectedProduct }: Props) => {
    return (
        <div className='flex-expand'>
            <p className='text-left'>{translations.or_use_saved_method}</p>
            <form className='form' id='aofSelectionForm'>
                {accountsOnFile.map((aof) => (
                    <Radio
                        key={aof.id}
                        id={aof.id.toString()}
                        name='paymentMethod'
                        label={aof.label}
                        value={aof.id.toString()}
                        onChange={onSelectedProduct}
                    />
                ))}
            </form>
        </div>
    );
};
export default AccountOnFileSelection;
