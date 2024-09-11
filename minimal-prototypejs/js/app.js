const sessionDetails = config;

const paymentDetails = {
  totalAmount: 10000,
  countryCode: 'NL',
  locale: 'nl_NL',
  currency: 'EUR',
  isRecurring: false,
};

// check if the sessionDetails are filled; this is vital for continuing
if (Object.values(sessionDetails).some((value) => !value)) {
  console.error('please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails');
  document.querySelector(
      '.output').innerText = 'please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails';
}

const cardNumber = '4567 3500 0042 7977';

const session = new onlinepaymentssdk.Session(sessionDetails);

createPayload(session, cardNumber, paymentDetails);
