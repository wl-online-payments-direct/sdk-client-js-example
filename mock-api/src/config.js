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
import selfSigned from 'selfsigned';
import fs from 'fs';

export const setup = () => {
    // server certificate
    if (!fs.existsSync('./cert/cert.key')) {
        if (!fs.existsSync('./cert')) {
            fs.mkdirSync('./cert');
        }

        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const options = { days: 365, selfSigned: true, keySize: 4096 };

        const keys = selfSigned.generate(attrs, options);

        fs.writeFileSync('./cert/cert.pem', keys.cert);
        fs.writeFileSync('./cert/cert.key', keys.private);
    }

    // setup tokens db
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }

    if (!fs.existsSync('./data/db.json')) {
        fs.writeFileSync('./data/db.json', '{\n  "tokens": []\n}', { encoding: 'utf8' });
    }
};

export default {
    setup
};
