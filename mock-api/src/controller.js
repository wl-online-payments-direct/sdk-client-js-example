import onlinePaymentsSdk from 'onlinepayments-sdk-nodejs';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new JSONFileSync('./data/db.json');
const db = new LowSync(adapter, { tokens: [] });
db.read();

const config = {
    merchantId: process.env.MERCHANT_ID,
    apiKeyId: process.env.MERCHANT_API_KEY,
    secretApiKey: process.env.MERCHANT_API_SECRET,
    host: process.env.HOST,
    apiUrl: `https://${process.env.API_URL || 'localhost'}:${Number(process.env.API_PORT || 5777)}/`
};

const sdk = onlinePaymentsSdk.init({
    integrator: 'OnlinePayments', // used for identification in logs
    host: config.host, // Note: Use the endpoint without the /v2/ part here. This endpoint is pointing to the TEST server
    apiKeyId: config.apiKeyId,
    secretApiKey: config.secretApiKey
});

export const createSession = async (req, res) => {
    return new Promise((resolve) => {
        sdk.sessions
            .createSession(
                config.merchantId,
                {
                    tokens: db.data.tokens || []
                },
                {}
            )
            .then((sdkResponse) => {
                sdkResponse.body.invalidTokens?.forEach((token) => {
                    db.data.tokens = db.data.tokens.filter((t) => t !== token);
                    db.write();
                });

                resolve(res.status(sdkResponse.status).json(sdkResponse.body));
            });
    });
};

export const processPayment = (req, res) => {
    const paymentData = {
        order: {
            amountOfMoney: req.body.amountOfMoney,
            customer: {
                billingAddress: {
                    countryCode: req.body.countryCode
                },
                contactDetails: {
                    emailAddress: 'wile.e.coyote@acmelabs.com',
                    phoneNumber: '+321234567890'
                },
                device: {
                    acceptHeader:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    browserData: {
                        colorDepth: 99,
                        javaEnabled: true,
                        javaScriptEnabled: true,
                        screenHeight: '768',
                        screenWidth: '1024'
                    },
                    ipAddress: '123.123.123.123',
                    locale: 'en_GB',
                    userAgent:
                        'Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/75.0.3770.142Safari/537.36',
                    timezoneOffsetUtcMinutes: '-180'
                }
            },
            shipping: {
                addressIndicator: 'same-as-billing',
                emailAddress: 'wile.e.coyote@acmelabs.com',
                firstUsageDate: '20100101',
                isFirstUsage: false,
                method: {
                    details: 'quickshipment',
                    name: 'fast-delivery',
                    speed: 24,
                    type: 'carrier-low-cost'
                },
                type: 'overnight',
                shippingCost: 0,
                shippingCostTax: 0
            }
        }
    };

    if (req.body.data) {
        paymentData.encryptedCustomerInput = req.body.data;
    } else if (req.body.token) {
        paymentData.cardPaymentMethodSpecificInput = {
            token: req.body.token,
            card: {
                cvv: req.body.cvv
            },
            unscheduledCardOnFileRequestor: 'cardholderInitiated',
            unscheduledCardOnFileSequenceIndicator: 'subsequent',
            paymentProductId: req.body.paymentProductId,
            transactionChannel: 'ECOMMERCE',
            authorizationMode: 'SALE'
        };
    }

    console.log(JSON.stringify(paymentData));

    return new Promise((resolve) => {
        try {
            sdk.payments.createPayment(config.merchantId, paymentData, {}).then((sdkResponse) => {
                const token = sdkResponse.body?.creationOutput?.token;
                if (token && !db.data.tokens.includes(token)) {
                    db.data.tokens.push(token);
                    db.write();
                }

                resolve(res.status(sdkResponse.status).json(sdkResponse.body));
            });
        } catch (error) {
            resolve(res.status(400).json(error));
        }
    });
};

export const getTokens = (req, res) => {
    const tokens = db.data.tokens;
    const merchantId = req.params.merchantId;
    if (!tokens?.length) {
        return res.status(200).json([]);
    }

    return new Promise((resolve) => {
        const result = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            sdk.tokens.getToken(merchantId, token, {}, (error, sdkResponse) => {
                if (!error && (sdkResponse.body.card?.alias || sdkResponse.body.eWallet?.alias)) {
                    result.push({
                        id: token,
                        type: sdkResponse.body.card ? 'card' : 'eWallet',
                        label: sdkResponse.body.card?.alias || sdkResponse.body.eWallet?.alias,
                        productId: sdkResponse.body.paymentProductId
                    });
                }

                if (i === tokens.length - 1) {
                    resolve(res.status(200).json(result));
                }
            });
        }
    });
};

