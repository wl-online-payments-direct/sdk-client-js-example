const onlinepayments = require('onlinepayments-sdk-client-js').onlinepaymentssdk;
const createPayload = require('./create-payload');

const sessionDetails = {
  clientSessionId: '',
  customerId: '',
  clientApiUrl: '',
  assetUrl: '',
};

const paymentDetails = {
  totalAmount: 10000,
  countryCode: 'NL',
  locale: 'nl_NL',
  currency: 'EUR',
  isRecurring: false,
};

const cardNumber = '4567 3500 0042 7977';

const session = new onlinepayments.Session(sessionDetails);

createPayload(session, cardNumber, paymentDetails);
