const applicationController = require('./controller.js');

const setRoutes = (server) => {
    server.get('/session', applicationController.createSession);
    server.post('/payment', applicationController.processPayment);
    server.get('/tokens/:merchantId', applicationController.getTokens);
};

module.exports = {
    setRoutes
};
