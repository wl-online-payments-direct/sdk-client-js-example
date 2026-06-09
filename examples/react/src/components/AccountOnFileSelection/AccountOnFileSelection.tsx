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
