const selfSigned = require('selfsigned');
const fs = require('fs');

const setup = () => {
    // server certificate
    if (!fs.existsSync('./cert/cert.key')) {
        if (!fs.existsSync('./cert')) {
            fs.mkdirSync('./cert');
        }

        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const options = { days: 365, selfSigned: true };

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

module.exports = {
    setup
};
