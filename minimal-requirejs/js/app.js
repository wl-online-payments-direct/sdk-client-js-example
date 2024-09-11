requirejs(["onlinepaymentssdk.Session", "config"], function (sdksession, config) {
    const sessionDetails = config;

    const paymentDetails = {
        totalAmount: 10000,
        countryCode: "NL",
        locale: "nl_NL",
        currency: "EUR",
        isRecurring: false
    };

    // check if the sessionDetails are filled; this is vital for continuing
    if (Object.values(sessionDetails).some((value) => !value)) {
        console.error("please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails");
        document.querySelector('.output').innerText = "please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails";
    }

    const session = new sdksession(sessionDetails);
    const cardNumber = '4567 3500 0042 7977';

    // now we can use this information to do the lookup and create the payment, this is common for all module loaders.
    createPayload(session, cardNumber, paymentDetails);
});
