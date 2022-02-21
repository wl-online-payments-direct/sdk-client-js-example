window.forge = require('node-forge');
var onlinepayments = require('onlinepaymentssdk.session');

var sessionDetails = {
    clientSessionId: "",
    customerId: "",
    clientApiUrl: "",
    assetUrl: ""
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: "NL",
    locale: "nl_NL",
    currency: "EUR",
    isRecurring: false
};

var cardNumber = '4567 3500 0042 7977';

var session = new onlinepayments(sessionDetails);

createPayload(session, cardNumber, paymentDetails);
